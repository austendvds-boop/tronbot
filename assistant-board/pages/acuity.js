import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AcuityDashboard() {
  const [schedule, setSchedule] = useState({ austen: [], dad: [] });
  const [filteredSchedule, setFilteredSchedule] = useState({ austen: [], dad: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCombinedSchedule();
  }, []);

  useEffect(() => {
    // Filter schedule based on search
    if (searchQuery) {
      const filtered = {
        austen: schedule.austen.filter(l => 
          l.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.location.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        dad: schedule.dad.filter(l => 
          l.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
      };
      setFilteredSchedule(filtered);
    } else {
      setFilteredSchedule(schedule);
    }
  }, [searchQuery, schedule]);

  const fetchCombinedSchedule = async () => {
    try {
      // This would fetch from both Acuity accounts via API
      const mockData = {
        austen: [
          { id: '1', student: 'Will Weng', time: '8:30am', instructor: 'Aaron', lesson: '2 of 4', location: 'Tempe', date: '2026-02-03' },
          { id: '2', student: 'Demarious Johnson', time: '8:30am', instructor: 'Ryan', lesson: '2 of 4', location: 'Gilbert', date: '2026-02-03' },
          { id: '3', student: 'Enzo Cascio', time: '2:30pm', instructor: 'Ryan', lesson: '1 of 4', location: 'Scottsdale', date: '2026-02-03' },
          { id: '4', student: 'Alexis Hayes', time: '2:30pm', instructor: 'Austen', lesson: 'Single', location: 'Greenway', date: '2026-02-03' },
          { id: '5', student: 'Thomas Chutes', time: '2:30pm', instructor: 'Aaron', lesson: '1 of 4', location: 'Gilbert', date: '2026-02-03' },
          { id: '6', student: 'Keaton Huls', time: '5:30pm', instructor: 'Ryan', lesson: '1 of 2', location: 'Downtown Phoenix', date: '2026-02-03' },
          { id: '7', student: 'Lily Vaughan', time: '5:30pm', instructor: 'Aaron', lesson: '1 of ?', location: 'Gilbert', date: '2026-02-03' }
        ],
        dad: [
          { id: '8', student: 'Brayden Miller', time: '2:30pm', instructor: 'Ernie', lesson: '1 of 4', location: 'Peoria', date: '2026-02-04' }
        ]
      };
      
      setSchedule(mockData);
      setFilteredSchedule(mockData);
    } catch (err) {
      setError('Failed to load schedule');
    }
    setLoading(false);
  };

  const handleReschedule = (lesson) => {
    setSelectedLesson(lesson);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = async (newTime) => {
    // This would call Acuity API to reschedule
    setNotification(`Rescheduling ${selectedLesson.student} to ${newTime}...`);
    
    // Notify Claw
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reschedule-request',
        task: { title: `Reschedule ${selectedLesson.student} to ${newTime}`, id: selectedLesson.id },
        timestamp: new Date().toISOString()
      })
    });
    
    setShowRescheduleModal(false);
    setSelectedLesson(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScheduleNew = async (lessonData) => {
    setNotification(`Scheduling new lesson for ${lessonData.student}...`);
    
    // Notify Claw
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'new-schedule-request',
        task: { title: `Schedule ${lessonData.student} - ${lessonData.time}`, ...lessonData },
        timestamp: new Date().toISOString()
      })
    });
    
    setShowScheduleModal(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { borderBottom: '2px solid #30363d', paddingBottom: '10px', marginBottom: '20px' },
    backLink: { color: '#58a6ff', textDecoration: 'none', marginBottom: '10px', display: 'inline-block' },
    controls: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    searchInput: { 
      padding: '10px 15px', 
      flex: 1,
      minWidth: '250px',
      border: '1px solid #30363d', 
      borderRadius: '6px',
      background: '#0d1117',
      color: '#c9d1d9',
      fontSize: '14px'
    },
    button: { 
      padding: '10px 20px', 
      border: 'none', 
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    primaryBtn: { background: '#238636', color: 'white' },
    secondaryBtn: { background: '#1f6feb', color: 'white' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    column: { background: '#161b22', padding: '15px', borderRadius: '8px', border: '1px solid #30363d' },
    columnTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', padding: '10px', background: '#21262d', color: '#c9d1d9', borderRadius: '4px', textAlign: 'center', border: '1px solid #30363d' },
    lessonList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
    lessonCard: { 
      background: '#0d1117', 
      padding: '12px', 
      borderRadius: '6px',
      borderLeft: '4px solid #238636',
      border: '1px solid #30363d',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    lessonCardHover: { background: '#1f242c' },
    austenCard: { borderLeftColor: '#58a6ff' },
    dadCard: { borderLeftColor: '#d29922' },
    studentName: { fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' },
    lessonInfo: { fontSize: '12px', color: '#8b949e', marginBottom: '2px' },
    actionButtons: { display: 'flex', gap: '8px', marginTop: '8px' },
    smallBtn: { 
      padding: '4px 10px', 
      border: 'none', 
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px'
    },
    rescheduleBtn: { background: '#d29922', color: 'black' },
    summary: { 
      display: 'flex', 
      gap: '20px', 
      marginBottom: '20px',
      background: '#161b22',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #30363d'
    },
    summaryItem: { textAlign: 'center', flex: 1 },
    summaryNumber: { fontSize: '32px', fontWeight: 'bold', color: '#58a6ff' },
    summaryLabel: { fontSize: '12px', color: '#8b949e' },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: '#161b22',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #30363d',
      maxWidth: '500px',
      width: '90%'
    },
    modalTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '12px',
      border: '1px solid #30363d',
      borderRadius: '4px',
      background: '#0d1117',
      color: '#c9d1d9'
    },
    notification: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#238636',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '6px',
      zIndex: 2000
    },
    empty: { color: '#8b949e', fontStyle: 'italic', padding: '20px', textAlign: 'center' }
  };

  const totalLessons = filteredSchedule.austen.length + filteredSchedule.dad.length;

  return (
    <div style={styles.container}>
      <Head>
        <title>Combined Schedule | DVDS</title>
        <style>{`body { margin: 0; background-color: #0d1117; color: #c9d1d9; } html { background-color: #0d1117; }`}</style>
      </Head>
      
      <a href="/" style={styles.backLink}>â† Back to Task Board</a>
      
      <header style={styles.header}>
        <h1>Combined Acuity Dashboard</h1>
        <p>View, search, reschedule, and schedule lessons</p>
      </header>

      {/* Controls */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search students, instructors, locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button 
          onClick={() => setShowScheduleModal(true)}
          style={{...styles.button, ...styles.primaryBtn}}
        >
          + Schedule New Lesson
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div style={styles.notification}>{notification}</div>
      )}

      {/* Summary */}
      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <div style={styles.summaryNumber}>{totalLessons}</div>
          <div style={styles.summaryLabel}>Lessons Found</div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryNumber}>{filteredSchedule.austen.length}</div>
          <div style={styles.summaryLabel}>Austen's Team</div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryNumber}>{filteredSchedule.dad.length}</div>
          <div style={styles.summaryLabel}>Dad's Team</div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div style={styles.grid}>
        {/* Austen's Account */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>Austen's Account</div>
          {filteredSchedule.austen.length === 0 ? (
            <div style={styles.empty}>No lessons found</div>
          ) : (
            <ul style={styles.lessonList}>
              {filteredSchedule.austen.map((lesson) => (
                <li key={lesson.id} style={{...styles.lessonCard, ...styles.austenCard}}>
                  <div style={styles.studentName}>{lesson.student}</div>
                  <div style={styles.lessonInfo}>{lesson.date} at {lesson.time} | {lesson.location}</div>
                  <div style={styles.lessonInfo}>Lesson {lesson.lesson} | Instructor: {lesson.instructor}</div>
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={() => handleReschedule(lesson)}
                      style={{...styles.smallBtn, ...styles.rescheduleBtn}}
                    >
                      Reschedule
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dad's Account */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>Dad's Account</div>
          {filteredSchedule.dad.length === 0 ? (
            <div style={styles.empty}>No lessons found</div>
          ) : (
            <ul style={styles.lessonList}>
              {filteredSchedule.dad.map((lesson) => (
                <li key={lesson.id} style={{...styles.lessonCard, ...styles.dadCard}}>
                  <div style={styles.studentName}>{lesson.student}</div>
                  <div style={styles.lessonInfo}>{lesson.date} at {lesson.time} | {lesson.location}</div>
                  <div style={styles.lessonInfo}>Lesson {lesson.lesson} | Instructor: {lesson.instructor}</div>
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={() => handleReschedule(lesson)}
                      style={{...styles.smallBtn, ...styles.rescheduleBtn}}
                    >
                      Reschedule
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedLesson && (
        <div style={styles.modal} onClick={() => setShowRescheduleModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Reschedule {selectedLesson.student}</h3>
            <p>Current: {selectedLesson.date} at {selectedLesson.time}</p>
            <p>Instructor: {selectedLesson.instructor}</p>
            <input 
              type="text" 
              placeholder="New date (YYYY-MM-DD)"
              style={styles.input}
              id="newDate"
            />
            <input 
              type="text" 
              placeholder="New time (e.g., 2:30pm)"
              style={styles.input}
              id="newTime"
            />
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                style={{...styles.button, background: '#30363d', color: 'white'}}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const date = document.getElementById('newDate').value;
                  const time = document.getElementById('newTime').value;
                  if (date && time) confirmReschedule(`${date} ${time}`);
                }}
                style={{...styles.button, ...styles.primaryBtn}}
              >
                Request Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule New Modal */}
      {showScheduleModal && (
        <div style={styles.modal} onClick={() => setShowScheduleModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Schedule New Lesson</h3>
            <input type="text" placeholder="Student name" style={styles.input} id="newStudent" />
            <input type="text" placeholder="Date (YYYY-MM-DD)" style={styles.input} id="scheduleDate" />
            <input type="text" placeholder="Time (e.g., 2:30pm)" style={styles.input} id="scheduleTime" />
            <input type="text" placeholder="Location" style={styles.input} id="scheduleLocation" />
            <select style={styles.input} id="scheduleInstructor">
              <option value="">Select instructor...</option>
              <option value="Austen">Austen</option>
              <option value="Aaron">Aaron</option>
              <option value="Ryan">Ryan</option>
              <option value="Ernie">Ernie</option>
              <option value="Michelle">Michelle</option>
            </select>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setShowScheduleModal(false)}
                style={{...styles.button, background: '#30363d', color: 'white'}}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleScheduleNew({
                    student: document.getElementById('newStudent').value,
                    date: document.getElementById('scheduleDate').value,
                    time: document.getElementById('scheduleTime').value,
                    location: document.getElementById('scheduleLocation').value,
                    instructor: document.getElementById('scheduleInstructor').value
                  });
                }}
                style={{...styles.button, ...styles.primaryBtn}}
              >
                Request Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Loading schedule...</p>}
      {error && <p style={{color: '#da3633'}}>{error}</p>}
    </div>
  );
}