/* ==================== BULK SMS TRIAL MODULE (js/sms.js) ==================== */

function bulkSmsPage() {
  if (typeof currentRole !== 'undefined' && currentRole === 'student') {
    document.getElementById('content').innerHTML = '<div class="card empty">Students cannot access SMS service.</div>';
    return;
  }

  const allCls = typeof getAllActiveClasses === 'function' ? getAllActiveClasses() : [];
  const totalStudents = typeof students !== 'undefined' ? students.length : 0;
  const totalTeachers = typeof teachers !== 'undefined' ? teachers.length : 0;

  document.getElementById('content').innerHTML = `
    <div class="section-head">
      <div>
        <h2 style="font-size:18px;margin:0">💬 Bulk SMS Gateway (Trial Mode)</h2>
        <p>Class-wise ya Sabhi Students/Parents ko ek saath message send karein.</p>
      </div>
      <span class="tag green" style="font-size:11px;">🧪 Trial / Simulator Active</span>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="section-head"><h2>Send New SMS</h2></div>
        <form onsubmit="dispatchBulkSms(event)">
          <div class="field">
            <label>TARGET AUDIENCE (KISKO BHEJNA HAI)</label>
            <select id="smsTarget" onchange="updateSmsRecipientCount()">
              <option value="all">📢 All Students (Sabhi Ko Ek Saath - ${totalStudents})</option>
              ${allCls.map(c => {
                let cnt = students.filter(s => (s.class + '-' + (s.section || 'A')) === c || s.class === c).length;
                return `<option value="class:${c}">🏫 Class ${c} (${cnt} Students)</option>`;
              }).join('')}
              <option value="due_fees">⏳ Fees Due Students Only (Baki Fees Wale)</option>
              <option value="teachers">👨‍🏫 All Teachers (${totalTeachers} Staff)</option>
            </select>
          </div>

          <div class="field">
            <label>QUICK TEMPLATES (AUTO-FILL)</label>
            <select id="smsQuickTemplate" onchange="applySmsTemplate(this.value)">
              <option value="">-- Select Template --</option>
              <option value="holiday">Chhutti (Holiday Notice)</option>
              <option value="fees">Fees Reminder (Fees Jama Karne Hetu)</option>
              <option value="ptm">PTM Meeting Alert</option>
              <option value="exam">Exam Schedule Notice</option>
            </select>
          </div>

          <div class="field">
            <label>MESSAGE TEXT</label>
            <textarea id="smsBody" placeholder="Apna SMS message yahan likhein..." oninput="updateSmsCharCount()" required></textarea>
            <div class="mini" style="display:flex; justify-content:space-between; margin-top:4px;">
              <span id="smsCharInfo">0 characters (1 SMS credit)</span>
              <span id="smsCountBadge" class="tag green">0 Numbers Selected</span>
            </div>
          </div>

          <button class="btn" id="btnDispatchSms" style="width:100%;">🚀 Send Bulk SMS</button>
        </form>
      </div>

      <div class="card">
        <div class="section-head">
          <h2>Recent SMS Logs</h2>
          <span class="tag">Cloud Saved</span>
        </div>
        <div id="smsLogsContainer">
          <div class="empty">Loading SMS logs...</div>
        </div>
      </div>
    </div>
  `;

  updateSmsRecipientCount();
  loadSmsLogs();
}

function updateSmsCharCount() {
  const text = typeof val === 'function' ? val('smsBody') : (document.getElementById('smsBody')?.value || '');
  const info = document.getElementById('smsCharInfo');
  if (info) {
    const parts = Math.ceil(text.length / 160) || 1;
    info.textContent = `${text.length} characters (${parts} SMS credit per number)`;
  }
}

function updateSmsRecipientCount() {
  const t = typeof val === 'function' ? val('smsTarget') : (document.getElementById('smsTarget')?.value || '');
  let numList = [];

  if (typeof students !== 'undefined') {
    if (t === 'all') {
      numList = students.map(s => s.mobile).filter(m => m && String(m).length >= 10);
    } else if (t === 'due_fees') {
      numList = students.filter(s => (Number(s.fees || 0) - Number(s.paid || 0)) > 0)
                        .map(s => s.mobile)
                        .filter(m => m && String(m).length >= 10);
    } else if (t.startsWith('class:')) {
      const cls = t.split(':')[1];
      numList = students.filter(s => (s.class + '-' + (s.section || 'A')) === cls || s.class === cls)
                        .map(s => s.mobile)
                        .filter(m => m && String(m).length >= 10);
    }
  }

  if (t === 'teachers' && typeof teachers !== 'undefined') {
    numList = teachers.map(x => x.mobile).filter(m => m && String(m).length >= 10);
  }

  numList = Array.from(new Set(numList));
  const badge = document.getElementById('smsCountBadge');
  if (badge) badge.textContent = `${numList.length} Numbers Selected`;
}

function applySmsTemplate(type) {
  const el = document.getElementById('smsBody');
  if (!el) return;
  if (type === 'holiday') {
    el.value = 'Dear Parent, Kal aavashyak kaaran se school me avkash (holiday) rahega. Niyamit kakshayein agle karya-divas se chalengi. - Rambharose Inter College.';
  } else if (type === 'fees') {
    el.value = 'Aadarniya Abhibhavak, Kripya apne bachhe ki baki school fees samay par jama karein taaki shiksha bina rukawat jaari rahe. - RBIC Samadkheda.';
  } else if (type === 'ptm') {
    el.value = 'Dear Parent, School me Parents-Teacher Meeting (PTM) aayojit hai. Kripya samay par aakar report card prapt karein. - Principal, RBIC.';
  } else if (type === 'exam') {
    el.value = 'Aadarniya Abhibhavak, Aane wali pariksha ka schedule jaari kar diya gaya hai. Bachho ki taiyari par vishesh dhyan dein. - RBIC.';
  }
  updateSmsCharCount();
}

async function dispatchBulkSms(e) {
  e.preventDefault();
  const target = typeof val === 'function' ? val('smsTarget') : document.getElementById('smsTarget').value;
  const msg = (typeof val === 'function' ? val('smsBody') : document.getElementById('smsBody').value).trim();
  if (!msg) { if (typeof toast === 'function') toast('Message khali nahi ho sakta'); return; }

  let targetStudents = [];
  if (typeof students !== 'undefined') {
    if (target === 'all') targetStudents = students;
    else if (target === 'due_fees') targetStudents = students.filter(s => (Number(s.fees || 0) - Number(s.paid || 0)) > 0);
    else if (target.startsWith('class:')) {
      const cls = target.split(':')[1];
      targetStudents = students.filter(s => (s.class + '-' + (s.section || 'A')) === cls || s.class === cls);
    }
  }

  let numbers = [];
  if (target === 'teachers' && typeof teachers !== 'undefined') {
    numbers = teachers.map(t => t.mobile).filter(m => m && String(m).length >= 10);
  } else {
    numbers = targetStudents.map(s => s.mobile).filter(m => m && String(m).length >= 10);
  }
  numbers = Array.from(new Set(numbers));

  if (!numbers.length) {
    if (typeof toast === 'function') toast('❌ Is selection me koi valid mobile number nahi mila');
    return;
  }

  if (!confirm(`Kya aap sach me ${numbers.length} numbers par SMS bhejna chahte hain?`)) return;

  try {
    if (typeof toast === 'function') toast(`Processing SMS for ${numbers.length} recipients...`);
    const btn = document.getElementById('btnDispatchSms');
    if (btn) btn.disabled = true;

    const firestoreDb = window.db || firebase.firestore();
    const now = new Date();
    const displayTarget = target === 'all' ? 'All Students' : (target === 'due_fees' ? 'Fees Due Students' : (target === 'teachers' ? 'All Teachers' : 'Class ' + target.split(':')[1]));

    await firestoreDb.collection('schools').doc(window.RB_SCHOOL_ID).collection('smsLogs').add({
      target: displayTarget,
      message: msg,
      totalRecipients: numbers.length,
      numbersSample: numbers.slice(0, 5),
      mode: 'Trial Mode (Simulated)',
      sentBy: (typeof currentLoginId !== 'undefined' ? currentLoginId : 'ADMIN'),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      date: now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });

    if (typeof toast === 'function') toast(`✅ Trial SMS dispatched successfully to ${numbers.length} numbers!`);
    bulkSmsPage();
  } catch (err) {
    console.error('SMS Send Error:', err);
    if (typeof toast === 'function') toast('SMS Error: ' + (err.message || 'Failed'));
    const btn = document.getElementById('btnDispatchSms');
    if (btn) btn.disabled = false;
  }
}

async function loadSmsLogs() {
  const box = document.getElementById('smsLogsContainer');
  if (!box) return;
  try {
    const firestoreDb = window.db || firebase.firestore();
    const snap = await firestoreDb.collection('schools').doc(window.RB_SCHOOL_ID).collection('smsLogs').orderBy('createdAt', 'desc').limit(20).get();

    if (!snap.empty) {
      box.innerHTML = snap.docs.map(d => {
        const x = d.data();
        const escFn = typeof esc === 'function' ? esc : String;
        return `
          <div class="notice">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span class="tag green">${escFn(x.target)}</span>
              <span class="mini">${escFn(x.date || '')}</span>
            </div>
            <p style="margin:6px 0; color:var(--ink); font-size:12px;"><b>"${escFn(x.message)}"</b></p>
            <div class="mini" style="color:var(--muted);">
              Sent to: <b>${x.totalRecipients || 0} numbers</b> • By: <b>${escFn(x.sentBy || 'Admin')}</b>
            </div>
          </div>
        `;
      }).join('');
    } else {
      box.innerHTML = '<div class="empty">Abhi tak koi SMS campaign run nahi hua.</div>';
    }
  } catch (e) {
    box.innerHTML = '<div class="empty">No SMS logs found.</div>';
  }
}