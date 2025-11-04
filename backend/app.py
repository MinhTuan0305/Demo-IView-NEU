from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_from_directory
import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from werkzeug.utils import secure_filename
import sys
from unicodedata import normalize as uni_normalize
import re
import threading
import os
from typing import Optional, Dict, Any

# Supabase client
from dotenv import load_dotenv
try:
    from supabase import create_client, Client  # type: ignore
except Exception:
    create_client = None  # type: ignore
    Client = None  # type: ignore

# Import các module từ thư mục src
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from interview.generate_questions import process_file, read_env
from interview.ask import run_interactive_interview_from_json
from interview.evaluate import main as evaluate_interview
import traceback
import sys
import re

# Đảm bảo console trên Windows in Unicode UTF-8, tránh UnicodeEncodeError khi print tiếng Việt
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

def _safe_filename(text: str) -> str:
    try:
        from unicodedata import normalize as uni_normalize
        s = uni_normalize('NFKD', text)
        s = s.encode('ascii', 'ignore').decode('ascii')
    except Exception:
        s = text
    s = s.replace(' ', '_')
    s = re.sub(r'[^A-Za-z0-9._-]+', '', s)
    return s or 'candidate'

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Thay đổi trong production

# Cấu hình upload
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif', 'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Tạo các thư mục cần thiết
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('outputs/interview_logs', exist_ok=True)
os.makedirs('outputs/evaluate_results', exist_ok=True)
os.makedirs('interview_question', exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _slug_name(name: str) -> str:
    try:
        n = uni_normalize('NFKD', name)
        n = n.encode('ascii', 'ignore').decode('ascii')  # strip accents to pure ASCII
    except Exception:
        n = name
    n = n.lower()
    n = re.sub(r'[^a-z0-9._-]+', '', n)
    return n

# -------------------- Supabase helpers --------------------
_supabase: Optional["Client"] = None

def _get_supabase() -> Optional["Client"]:
    global _supabase
    if _supabase is not None:
        return _supabase
    try:
        load_dotenv()
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')
        if not url or not key or create_client is None:
            return None
        _supabase = create_client(url, key)
        return _supabase
    except Exception:
        return None

def _db_upsert_candidate(candidate_id: str, candidate_name: str) -> None:
    client = _get_supabase()
    if not client:
        return
    try:
        client.table('candidates').upsert({
            'candidate_id': candidate_id,
            'candidate_name': candidate_name,
        }, on_conflict='candidate_id').execute()
    except Exception:
        pass

def _db_insert_interview_log(payload: Dict[str, Any]) -> Optional[int]:
    client = _get_supabase()
    if not client:
        return None
    try:
        data = {
            'candidate_id': payload.get('id'),
            'candidate_name': payload.get('candidate_name'),
            'interview_date': payload.get('interview_date'),
            'responses': payload.get('responses'),  # JSONB
        }
        res = client.table('interview_logs').insert(data).execute()
        # Expect returning id
        if getattr(res, 'data', None) and isinstance(res.data, list) and res.data:
            row = res.data[0]
            return int(row.get('id')) if isinstance(row.get('id'), (int,)) else None
    except Exception:
        return None
    return None

def _db_insert_evaluate_result(interview_log_id: Optional[int], result: Dict[str, Any]) -> None:
    client = _get_supabase()
    if not client:
        return
    try:
        data = {
            'interview_log_id': interview_log_id,
            'result': result,  # JSONB
        }
        client.table('evaluate_results').insert(data).execute()
    except Exception:
        pass

@app.route('/')
def index():
    """Trang chủ"""
    return render_template('index.html')

@app.route('/upload_cv', methods=['GET', 'POST'])
def upload_cv():
    """Trang upload CV và tạo câu hỏi"""
    if request.method == 'POST':
        # Kiểm tra file upload
        if 'cv_file' not in request.files:
            flash('Không có file được chọn', 'error')
            return redirect(request.url)
        
        file = request.files['cv_file']
        if file.filename == '':
            flash('Không có file được chọn', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            # Lưu file
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Lấy thông tin từ form
            job_title = request.form.get('job_title', '').strip()
            level = request.form.get('level', '').strip()
            
            if not job_title or not level:
                flash('Vui lòng nhập đầy đủ thông tin vị trí và level', 'error')
                return redirect(request.url)
            
            try:
                # Tạo câu hỏi phỏng vấn
                read_env()  # Đọc API key
                output_dir = Path('interview_question')
                output_dir.mkdir(exist_ok=True)
                
                # Tạo tên file output dựa trên file CV thực tế (có UUID)
                base_name = Path(unique_filename).stem
                questions_file = output_dir / f"{base_name}.questions.json"
                
                # Gọi hàm tạo câu hỏi
                from interview.generate_questions import process_file
                process_file(Path(file_path), job_title, level, output_dir)
                
                # Tìm file câu hỏi đã được tạo (có thể có tên khác do UUID)
                actual_questions_file = None
                for file in output_dir.glob("*.questions.json"):
                    if file.stem.startswith(base_name.split('_')[0]):  # Tìm file có UUID tương ứng
                        actual_questions_file = file.name
                        break
                
                if actual_questions_file:
                    questions_file = actual_questions_file
                
                # Kiểm tra file đã được tạo
                if actual_questions_file and (output_dir / actual_questions_file).exists():
                    flash(f'Đã tạo thành công câu hỏi phỏng vấn cho {job_title} - {level}', 'success')
                    return redirect(url_for('interview', questions_file=actual_questions_file))
                else:
                    flash('Có lỗi xảy ra khi tạo câu hỏi phỏng vấn', 'error')
                    
            except Exception as e:
                flash(f'Lỗi: {str(e)}', 'error')
        else:
            flash('File không được hỗ trợ. Vui lòng chọn file PNG, JPG, PDF', 'error')
    
    return render_template('upload_cv.html')

@app.route('/interview')
def interview():
    """Trang phỏng vấn"""
    questions_file = request.args.get('questions_file')
    if not questions_file:
        flash('Không tìm thấy file câu hỏi', 'error')
        return redirect(url_for('index'))
    
    # Đọc câu hỏi từ file
    questions_path = os.path.join('interview_question', questions_file)
    try:
        with open(questions_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        return render_template('interview.html', questions=questions, questions_file=questions_file)
    except FileNotFoundError:
        flash('Không tìm thấy file câu hỏi', 'error')
        return redirect(url_for('index'))
    except json.JSONDecodeError:
        flash('File câu hỏi không hợp lệ', 'error')
        return redirect(url_for('index'))

@app.route('/submit_interview', methods=['POST'])
def submit_interview():
    """Xử lý kết quả phỏng vấn"""
    try:
        data = request.get_json(silent=True) or {}
    except Exception:
        data = {}
    if not isinstance(data, dict):
        return jsonify({'error': 'Invalid JSON body'}), 400
    
    # Tạo file kết quả phỏng vấn
    candidate_name = str(data.get('candidate_name', 'Anonymous'))
    candidate_id = str(data.get('candidate_id', 'Anonymous'))
    responses = data.get('responses', [])
    if not isinstance(responses, list):
        responses = []
    interview_results = {
        "candidate_name": candidate_name,
        "id": candidate_id,
        "interview_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "responses": responses
    }
    
    # Lưu file kết quả (giữ cơ chế file để tương thích, đồng thời ghi DB)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = _safe_filename(interview_results['candidate_name'])
    filename = f"responses_{safe_name}_{timestamp}.json"
    filepath = os.path.join('outputs/interview_logs', filename)
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(interview_results, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print("[SUBMIT][ERROR] Không thể ghi file log:", e)
        traceback.print_exc()
        return jsonify({'error': 'cannot write log', 'message': str(e)}), 500
    
    # Log thông tin nhận được
    try:
        num_responses = len(interview_results.get('responses', []))
    except Exception:
        num_responses = -1
    print(f"[SUBMIT] Đã nhận bài phỏng vấn: {filename} | Số câu trả lời: {num_responses}")
    print(f"[SUBMIT] Đẩy tác vụ chấm điểm nền... input={filepath}")

    # Upsert ứng viên và lưu interview vào Supabase
    try:
        _db_upsert_candidate(candidate_id=candidate_id, candidate_name=candidate_name)
        db_log_id = _db_insert_interview_log(interview_results)
    except Exception:
        db_log_id = None

    def _run_eval(path, result_name, interview_log_id):
        try:
            evaluate_interview(path)
            print(f"[EVAL] Hoàn tất chấm điểm -> outputs/evaluate_results/{result_name}")
            # Đọc file kết quả để lưu DB (nếu có)
            try:
                result_path = os.path.join('outputs/evaluate_results', result_name)
                with open(result_path, 'r', encoding='utf-8') as rf:
                    result_json = json.load(rf)
                _db_insert_evaluate_result(interview_log_id, result_json)
            except Exception:
                traceback.print_exc()
        except Exception:
            print("[EVAL][ERROR] Lỗi khi đánh giá (thread):")
            traceback.print_exc()

    # chạy chấm điểm ở thread nền để trả response ngay
    t = threading.Thread(target=_run_eval, args=(filepath, filename.replace('.json', '_results.json'), db_log_id))
    t.daemon = True
    t.start()

    return jsonify({
        'success': True,
        'queued': True,
        'message': 'Đã nhận bài và đang chấm điểm',
        'log_file': filename
    }), 200

@app.route('/results')
def results():
    """Trang hiển thị kết quả"""
    results_dir = 'outputs/evaluate_results'
    results_files = []
    
    if os.path.exists(results_dir):
        for file in os.listdir(results_dir):
            if file.endswith('.json'):
                results_files.append(file)
    
    return render_template('results.html', results_files=results_files)

@app.route('/view_result/<filename>')
def view_result(filename):
    """Xem chi tiết kết quả"""
    try:
        filepath = os.path.join('outputs/evaluate_results', filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            result_data = json.load(f)
        return render_template('view_result.html', result=result_data, filename=filename)
    except FileNotFoundError:
        flash('Không tìm thấy file kết quả', 'error')
        return redirect(url_for('results'))
    except json.JSONDecodeError:
        flash('File kết quả không hợp lệ', 'error')
        return redirect(url_for('results'))

@app.route('/download/<path:filename>')
def download_file(filename):
    """Download file"""
    return send_from_directory('outputs/evaluate_results', filename, as_attachment=True)

@app.route('/api/questions/<filename>')
def get_questions(filename):
    """API để lấy câu hỏi"""
    try:
        base_dir = Path('interview_question')
        filepath = base_dir / filename
        if not filepath.exists():
            # Try resolve via the same strategy as resolver
            files = list(base_dir.glob('*.questions.json'))
            # exact match (case sensitive) already failed; try suffix ignoring uuid
            match = None
            prefix = filename.split('_')[0]
            candidates = [f for f in files if f.stem.startswith(prefix)] if prefix else []
            if candidates:
                match = max(candidates, key=lambda p: p.stat().st_mtime)
            elif '_' in filename:
                suffix = filename.split('_', 1)[1]
                suf_candidates = [f for f in files if f.name.endswith(suffix)]
                if suf_candidates:
                    match = max(suf_candidates, key=lambda p: p.stat().st_mtime)
            if not match:
                # last resort substring contains
                for f in files:
                    if filename in f.name:
                        match = f
                        break
            if match and match.exists():
                with open(match, 'r', encoding='utf-8') as f:
                    questions = json.load(f)
                return jsonify(questions)
            return jsonify({'error': 'File không tồn tại'}), 404
        with open(filepath, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        return jsonify(questions)
    except FileNotFoundError:
        return jsonify({'error': 'File không tồn tại'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'File không hợp lệ'}), 400

@app.route('/api/upload_cv', methods=['POST'])
def api_upload_cv():
    """API upload CV, trả về JSON thay vì render template"""
    # Kiểm tra file upload
    if 'cv_file' not in request.files:
        return jsonify({'success': False, 'message': 'Không có file được chọn'}), 400

    file = request.files['cv_file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Không có file được chọn'}), 400

    if not (file and allowed_file(file.filename)):
        return jsonify({'success': False, 'message': 'File không được hỗ trợ. Vui lòng chọn file PNG, JPG, PDF'}), 400

    # Lưu file
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)

    # Lấy thông tin từ form
    job_title = request.form.get('job_title', '').strip()
    level = request.form.get('level', '').strip()

    if not job_title or not level:
        return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ thông tin vị trí và level'}), 400

    try:
        # Tạo câu hỏi phỏng vấn
        read_env()  # Đọc API key
        output_dir = Path('interview_question')
        output_dir.mkdir(exist_ok=True)

        # Tạo tên file output dựa trên file CV thực tế (có UUID)
        base_name = Path(unique_filename).stem
        questions_file_candidate = output_dir / f"{base_name}.questions.json"

        # Gọi hàm tạo câu hỏi
        process_file(Path(file_path), job_title, level, output_dir)

        # Tìm file câu hỏi đã được tạo
        actual_questions_file = None
        for f in output_dir.glob("*.questions.json"):
            if f.stem.startswith(base_name.split('_')[0]):
                actual_questions_file = f.name
                break

        if actual_questions_file and (output_dir / actual_questions_file).exists():
            return jsonify({
                'success': True,
                'questions_file': actual_questions_file,
                'message': f'Đã tạo thành công câu hỏi cho {job_title} - {level}'
            })
        else:
            return jsonify({'success': False, 'message': 'Có lỗi xảy ra khi tạo câu hỏi phỏng vấn'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/resolve_questions_file')
def resolve_questions_file():
    """Resolve questions file by hint (full name, uuid prefix, or suffix after underscore). Returns best match or 404."""
    hint = request.args.get('hint', '').strip()
    if not hint:
        return jsonify({'error': 'missing hint'}), 400

    try:
        files = list(Path('interview_question').glob('*.questions.json'))
        if not files:
            return jsonify({'error': 'no files'}), 404

        # exact match
        for f in files:
            if f.name == hint:
                return jsonify({'match': f.name})

        # uuid prefix (before first underscore)
        prefix = hint.split('_')[0]
        candidates = [f for f in files if f.stem.startswith(prefix)] if prefix else []
        if candidates:
            best = max(candidates, key=lambda p: p.stat().st_mtime)
            return jsonify({'match': best.name})

        # suffix match (after the first underscore) – ignore UUID differences
        suffix = ''
        if '_' in hint:
            suffix = hint.split('_', 1)[1]
            # ensure we include the dot extension part
            if suffix:
                suf_candidates = [f for f in files if f.name.endswith(suffix)]
                if suf_candidates:
                    best = max(suf_candidates, key=lambda p: p.stat().st_mtime)
                    return jsonify({'match': best.name})

        # fallback: contains hint substring
        for f in files:
            if hint in f.name:
                return jsonify({'match': f.name})

        return jsonify({'error': 'not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/latest_questions_file')
def latest_questions_file():
    try:
        files = list(Path('interview_question').glob('*.questions.json'))
        if not files:
            return jsonify({'error': 'no files'}), 404
        best = max(files, key=lambda p: p.stat().st_mtime)
        return jsonify({'match': best.name})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/results')
def api_results():
    """JSON: list evaluation results. Prefer Supabase; fallback to files in outputs/evaluate_results."""
    client = _get_supabase()
    if client:
        try:
            # Try order by created_at desc if available; fallback to id desc
            try:
                res = client.table('evaluate_results').select('*').order('created_at', desc=True).execute()
            except Exception:
                res = client.table('evaluate_results').select('*').order('id', desc=True).execute()
            data = getattr(res, 'data', []) or []
            items = []
            for row in data:
                rid = row.get('id')
                result = row.get('result') or {}
                summary = result.get('summary') if isinstance(result, dict) else None
                # Expose a pseudo filename so frontend routes remain working
                items.append({
                    'filename': f"id:{rid}",
                    'modified': row.get('created_at') or row.get('id') or 0,
                    'summary': summary,
                })
            return jsonify(items)
        except Exception:
            pass

    # Fallback: read from files
    results_dir = Path('outputs/evaluate_results')
    items = []
    if results_dir.exists():
        for f in results_dir.glob('*.json'):
            try:
                with open(f, 'r', encoding='utf-8') as fp:
                    data = json.load(fp)
                summary = data.get('summary') or {}
                items.append({
                    'filename': f.name,
                    'modified': f.stat().st_mtime,
                    'summary': summary,
                })
            except Exception:
                items.append({ 'filename': f.name, 'modified': f.stat().st_mtime })
    items.sort(key=lambda x: x.get('modified', 0), reverse=True)
    return jsonify(items)

@app.route('/api/view_result/<filename>')
def api_view_result(filename):
    try:
        # Support DB id-based access: filename like "id:123"
        if filename.startswith('id:'):
            client = _get_supabase()
            if client:
                try:
                    rid = int(filename.split(':', 1)[1])
                except Exception:
                    return jsonify({'error': 'invalid id'}), 400
                try:
                    res = client.table('evaluate_results').select('*').eq('id', rid).single().execute()
                    row = getattr(res, 'data', None)
                    if not row:
                        return jsonify({'error': 'not found'}), 404
                    result_data = row.get('result') or {}
                    return jsonify(result_data)
                except Exception:
                    return jsonify({'error': 'db error'}), 500
        filepath = Path('outputs/evaluate_results') / filename
        if not filepath.exists():
            # try accent-insensitive + resolver
            results_dir = Path('outputs/evaluate_results')
            files = list(results_dir.glob('*.json'))
            slug_target = _slug_name(filename)
            for f in files:
                if _slug_name(f.name) == slug_target:
                    filepath = f
                    break
        if not filepath.exists():
            return jsonify({'error': 'File không tồn tại'}), 404
        with open(filepath, 'r', encoding='utf-8') as f:
            result_data = json.load(f)
        return jsonify(result_data)
    except FileNotFoundError:
        return jsonify({'error': 'File không tồn tại'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'File không hợp lệ'}), 400

@app.route('/api/view_result')
def api_view_result_qs():
    """View result by hint through query string to avoid URL encoding issues"""
    hint = request.args.get('hint', '')
    if not hint:
        return jsonify({'error': 'missing hint'}), 400
    # Support DB id-based access: hint like "id:123"
    if hint.startswith('id:'):
        client = _get_supabase()
        if client:
            try:
                rid = int(hint.split(':', 1)[1])
            except Exception:
                return jsonify({'error': 'invalid id'}), 400
            try:
                res = client.table('evaluate_results').select('*').eq('id', rid).single().execute()
                row = getattr(res, 'data', None)
                if not row:
                    return jsonify({'error': 'not found'}), 404
                result_data = row.get('result') or {}
                return jsonify(result_data)
            except Exception:
                return jsonify({'error': 'db error'}), 500
    # Reuse resolver then open
    results_dir = Path('outputs/evaluate_results')
    files = list(results_dir.glob('*.json'))
    # Try exact, slug, contains
    target = None
    for f in files:
        if f.name == hint or _slug_name(f.name) == _slug_name(hint) or hint in f.name or _slug_name(hint) in _slug_name(f.name):
            target = f
            break
    if not target:
        return jsonify({'error': 'File không tồn tại'}), 404
    try:
        with open(target, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except json.JSONDecodeError:
        return jsonify({'error': 'File không hợp lệ'}), 400

@app.route('/api/history')
def api_history():
    """Danh sách các phiên phỏng vấn (bao gồm pending nếu chưa có kết quả)"""
    client = _get_supabase()
    if client:
        try:
            # Fetch interview logs; newest first
            try:
                res_logs = client.table('interview_logs').select('*').order('created_at', desc=True).execute()
            except Exception:
                res_logs = client.table('interview_logs').select('*').order('id', desc=True).execute()
            logs = getattr(res_logs, 'data', []) or []
            items = []
            for lg in logs:
                log_id = lg.get('id')
                # Try to find matching evaluate_result
                try:
                    res_eval = client.table('evaluate_results').select('id,result').eq('interview_log_id', log_id).single().execute()
                    ev = getattr(res_eval, 'data', None)
                except Exception:
                    ev = None
                status = 'done' if ev else 'pending'
                entry = {
                    'log_file': f"id:{log_id}",
                    'result_file': f"id:{ev.get('id')}" if ev else None,
                    'status': status,
                    'modified': lg.get('created_at') or lg.get('id') or 0,
                }
                if ev and isinstance(ev.get('result'), dict):
                    entry['summary'] = ev['result'].get('summary')
                else:
                    # basic summary from log
                    resp = lg.get('responses') if isinstance(lg.get('responses'), list) else []
                    entry['summary'] = {
                        'candidate_name': lg.get('candidate_name'),
                        'interview_date': lg.get('interview_date'),
                        'questions_scored': len(resp),
                        'type': 'job'
                    }
                items.append(entry)
            return jsonify(items)
        except Exception:
            pass

    # Fallback to filesystem
    logs_dir = Path('outputs/interview_logs')
    results_dir = Path('outputs/evaluate_results')
    items = []
    if logs_dir.exists():
        for log in logs_dir.glob('*.json'):
            result_name = log.name.replace('.json', '_results.json')
            result_path = results_dir / result_name
            status = 'done' if result_path.exists() else 'pending'
            entry = {
                'log_file': log.name,
                'result_file': result_name if result_path.exists() else None,
                'status': status,
                'modified': log.stat().st_mtime,
            }
            if result_path.exists():
                try:
                    with open(result_path, 'r', encoding='utf-8') as fp:
                        data = json.load(fp)
                        entry['summary'] = data.get('summary')
                except Exception:
                    pass
            else:
                try:
                    with open(log, 'r', encoding='utf-8') as fp:
                        data = json.load(fp)
                        entry['summary'] = {
                            'candidate_name': data.get('candidate_name'),
                            'interview_date': data.get('interview_date'),
                            'type': 'job'
                        }
                except Exception:
                    pass
            items.append(entry)
    items.sort(key=lambda x: x.get('modified', 0), reverse=True)
    return jsonify(items)

@app.route('/api/result_status')
def api_result_status():
    """Kiểm tra xem kết quả cho log_file đã sẵn sàng chưa"""
    log_file = request.args.get('log')
    if not log_file:
        return jsonify({'error': 'missing log'}), 400
    # DB mode: log_file like "id:<log_id>"
    if log_file.startswith('id:'):
        client = _get_supabase()
        if client:
            try:
                lid = int(log_file.split(':', 1)[1])
            except Exception:
                return jsonify({'error': 'invalid id'}), 400
            try:
                res = client.table('evaluate_results').select('id').eq('interview_log_id', lid).single().execute()
                row = getattr(res, 'data', None)
                if row and row.get('id') is not None:
                    return jsonify({'ready': True, 'result_file': f"id:{row.get('id')}"})
                return jsonify({'ready': False})
            except Exception:
                return jsonify({'ready': False})
    # Fallback filesystem
    result_name = log_file.replace('.json', '_results.json')
    result_path = Path('outputs/evaluate_results') / result_name
    if result_path.exists():
        return jsonify({'ready': True, 'result_file': result_name})
    return jsonify({'ready': False})

@app.route('/api/resolve_result_file')
def resolve_result_file():
    hint = request.args.get('hint', '').strip()
    if not hint:
        return jsonify({'error': 'missing hint'}), 400
    results_dir = Path('outputs/evaluate_results')
    files = list(results_dir.glob('*.json'))
    if not files:
        return jsonify({'error': 'no files'}), 404
    # exact
    for f in files:
        if f.name == hint:
            return jsonify({'match': f.name})
    # accent-insensitive match
    slug_hint = _slug_name(hint)
    best = None
    for f in files:
        if _slug_name(f.name) == slug_hint:
            best = f
            break
    if best:
        return jsonify({'match': best.name})
    # suffix after first underscore
    if '_' in hint:
        suffix = hint.split('_', 1)[1]
        suf = [f for f in files if f.name.endswith(suffix)]
        if suf:
            best = max(suf, key=lambda p: p.stat().st_mtime)
            return jsonify({'match': best.name})
    # contains / accent-insensitive contains
    for f in files:
        if hint in f.name or _slug_name(hint) in _slug_name(f.name):
            return jsonify({'match': f.name})
    return jsonify({'error': 'not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
