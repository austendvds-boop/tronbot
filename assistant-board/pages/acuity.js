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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notification, setNotification] = useState(null);

  // Student history - starts with mock data, updates from API
  const [studentHistory, setStudentHistory] = useState({
    'Will Weng': {
      package: '4 Lesson Package',
      completed: [
        { date: '2026-01-15', time: '9:00am', instructor: 'Aaron', location: 'Tempe', lessonNum: 1, notes: 'Basic controls, parking' },
        { date: '2026-01-22', time: '10:00am', instructor: 'Aaron', location: 'Tempe', lessonNum: 2, notes: 'City driving, intersections' }
      ],
      upcoming: [
        { date: '2026-02-03', time: '8:30am', instructor: 'Aaron', location: 'Tempe', lessonNum: 3 }
      ],
      remaining: 1
    },
    'Demarious Johnson': {
      package: '4 Lesson Package',
      completed: [
        { date: '2026-01-20', time: '8:30am', instructor: 'Ryan', location: 'Gilbert', lessonNum: 1, notes: 'Intro, neighborhood driving' },
        { date: '2026-01-27', time: '8:30am', instructor: 'Ryan', location: 'Gilbert', lessonNum: 2, notes: 'Highway merge, lane changes' }
      ],
      upcoming: [
        { date: '2026-02-03', time: '8:30am', instructor: 'Ryan', location: 'Gilbert', lessonNum: 3 }
      ],
      remaining: 1
    },
    'Enzo Cascio': {
      package: '4 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '2:30pm', instructor: 'Ryan', location: 'Scottsdale', lessonNum: 1 }
      ],
      remaining: 3
    },
    'Alexis Hayes': {
      package: 'Single Lesson',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '2:30pm', instructor: 'Austen', location: 'Greenway', lessonNum: 1 }
      ],
      remaining: 0
    },
    'Thomas Chutes': {
      package: '4 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '2:30pm', instructor: 'Aaron', location: 'Gilbert', lessonNum: 1 }
      ],
      remaining: 3
    },
    'Keaton Huls': {
      package: '2 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '5:30pm', instructor: 'Ryan', location: 'Downtown Phoenix', lessonNum: 1 }
      ],
      remaining: 1
    },
    'Lily Vaughan': {
      package: 'Unknown',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '5:30pm', instructor: 'Aaron', location: 'Gilbert', lessonNum: 1 }
      ],
      remaining: '?'
    },
  const defaultHistory = {
    'Will Weng': {
      package: '4 Lesson Package',
      completed: [
        { date: '2026-01-15', time: '9:00am', instructor: 'Aaron', location: 'Tempe', lessonNum: 1, notes: 'Basic controls, parking' },
        { date: '2026-01-22', time: '10:00am', instructor: 'Aaron', location: 'Tempe', lessonNum: 2, notes: 'City driving, intersections' }
      ],
      upcoming: [
        { date: '2026-02-03', time: '8:30am', instructor: 'Aaron', location: 'Tempe', lessonNum: 3 }
      ],
      remaining: 1
    },
    'Demarious Johnson': {
      package: '4 Lesson Package',
      completed: [
        { date: '2026-01-20', time: '8:30am', instructor: 'Ryan', location: 'Gilbert', lessonNum: 1, notes: 'Intro, neighborhood driving' },
        { date: '2026-01-27', time: '8:30am', instructor: 'Ryan', location: 'Gilbert', lessonNum: 2, notes: 'Highway merge, lane changes' }
      ],
      upcoming: [
        { date: '2026-02-03', time: '8:30am', instructor: 'Ryan', location: 'Gilbert', lessonNum: 3 }
      ],
      remaining: 1
    },
    'Enzo Cascio': {
      package: '4 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '2:30pm', instructor: 'Ryan', location: 'Scottsdale', lessonNum: 1 }
      ],
      remaining: 3
    },
    'Alexis Hayes': {
      package: 'Single Lesson',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '2:30pm', instructor: 'Austen', location: 'Greenway', lessonNum: 1 }
      ],
      remaining: 0
    },
    'Thomas Chutes': {
      package: '4 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '2:30pm', instructor: 'Aaron', location: 'Gilbert', lessonNum: 1 }
      ],
      remaining: 3
    },
    'Keaton Huls': {
      package: '2 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '5:30pm', instructor: 'Ryan', location: 'Downtown Phoenix', lessonNum: 1 }
      ],
      remaining: 1
    },
    'Lily Vaughan': {
      package: 'Unknown',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '5:30pm', instructor: 'Aaron', location: 'Gilbert', lessonNum: 1 }
      ],
      remaining: '?'
    },
    'Brayden Miller': {
      package: '4 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-04', time: '2:30pm', instructor: 'Ernie', location: 'Peoria', lessonNum: 1 }
      ],
      remaining: 3
    },
    'Samantha Jones': {
      package: '4 Lesson Package',
      completed: [
        { date: '2026-01-25', time: '9:00am', instructor: 'Michelle', location: 'Glendale', lessonNum: 1, notes: 'First lesson, basics' }
      ],
      upcoming: [
        { date: '2026-02-03', time: '9:00am', instructor: 'Michelle', location: 'Glendale', lessonNum: 2 }
      ],
      remaining: 2
    },
    'Marcus Chen': {
      package: '4 Lesson Package',
      completed: [
        { date: '2026-01-18', time: '11:00am', instructor: 'Allan', location: 'Surprise', lessonNum: 1, notes: 'Parking practice' },
        { date: '2026-01-25', time: '11:00am', instructor: 'Allan', location: 'Surprise', lessonNum: 2, notes: 'Highway driving' }
      ],
      upcoming: [
        { date: '2026-02-03', time: '11:00am', instructor: 'Allan', location: 'Surprise', lessonNum: 3 }
      ],
      remaining: 1
    },
    'Emma Rodriguez': {
      package: '4 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '1:00pm', instructor: 'Bob', location: 'Sun City', lessonNum: 1 }
      ],
      remaining: 3
    },
    'Tyler Johnson': {
      package: '2 Lesson Package',
      completed: [
        { date: '2026-01-28', time: '3:30pm', instructor: 'Brandon', location: 'Goodyear', lessonNum: 1, notes: 'City driving' }
      ],
      upcoming: [
        { date: '2026-02-03', time: '3:30pm', instructor: 'Brandon', location: 'Goodyear', lessonNum: 2 }
      ],
      remaining: 0
    },
    'Ava Smith': {
      package: '4 Lesson Package',
      completed: [],
      upcoming: [
        { date: '2026-02-03', time: '5:00pm', instructor: 'Freddy', location: 'Litchfield Park', lessonNum: 1 }
      ],
      remaining: 3
    }
  };
  
  // Use default if not set yet
  const historyData = studentHistory || defaultHistory;

  useEffect(() => {
    fetchCombinedSchedule();
  }, []);

  useEffect(() => {
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
      // Fetch real data from Acuity API
      const response = await fetch('/api/schedule');
      const data = await response.json();
      
      setSchedule({ austen: data.austen, dad: data.dad });
      setFilteredSchedule({ austen: data.austen, dad: data.dad });
      
      // Update student history from real data
      updateStudentHistoryFromAPI([...data.austen, ...data.dad]);
    } catch (err) {
      console.error('Failed to load schedule:', err);
      setError('Failed to load schedule - showing cached data');
      // Fallback to empty if API fails
      setSchedule({ austen: [], dad: [] });
      setFilteredSchedule({ austen: [], dad: [] });
    }
    setLoading(false);
  };
  
  const updateStudentHistoryFromAPI = (appointments) => {
    // Build history from real appointment data
    const history = {};
    
    appointments.forEach(apt => {
      if (!history[apt.student]) {
        history[apt.student] = {
          package: apt.lesson.includes('Single') ? 'Single Lesson' : 
                   apt.lesson.includes('of 4') ? '4 Lesson Package' :
                   apt.lesson.includes('of 2') ? '2 Lesson Package' : 'Unknown',
          completed: [],
          upcoming: [],
          remaining: 0
        };
      }
      
      // Add to upcoming (for now - would need historical data from API)
      history[apt.student].upcoming.push({
        date: apt.date,
        time: apt.time,
        instructor: apt.instructor,
        location: apt.location,
        lessonNum: parseInt(apt.lesson.split(' of ')[0]) || 1
      });
    });
    
    // Merge with existing mock history for demo
    setStudentHistory(prev => ({ ...prev, ...history }));
  };

  const handleReschedule = (lesson) => {
    setSelectedLesson(lesson);
    setShowRescheduleModal(true);
  };

  const handleViewHistory = (studentName) => {
    setSelectedStudent(studentName);
    setShowHistoryModal(true);
  };

  const confirmReschedule = async (newTime) => {
    setNotification(`Rescheduling ${selectedLesson.student} to ${newTime}...`);
    
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
      transition: 'all 0.2s'
    },
    austenCard: { borderLeftColor: '#58a6ff' },
    dadCard: { borderLeftColor: '#d29922' },
    studentName: { fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', cursor: 'pointer' },
    studentNameHover: { color: '#58a6ff' },
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
    historyBtn: { background: '#1f6feb', color: 'white' },
    progressBar: { 
      height: '4px', 
      background: '#30363d', 
      borderRadius: '2px', 
      marginTop: '6px',
      overflow: 'hidden'
    },
    progressFill: { 
      height: '100%', 
      background: '#238636', 
      borderRadius: '2px'
    },
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
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' },
    historySection: { marginBottom: '20px' },
    historyTitle: { fontSize: '14px', fontWeight: 'bold', color: '#8b949e', marginBottom: '10px', textTransform: 'uppercase' },
    historyItem: {
      background: '#0d1117',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '8px',
      border: '1px solid #30363d'
    },
    historyDate: { fontWeight: 'bold', fontSize: '13px' },
    historyDetails: { fontSize: '12px', color: '#8b949e', marginTop: '4px' },
    historyNotes: { fontSize: '11px', color: '#58a6ff', marginTop: '4px', fontStyle: 'italic' },
    packageInfo: {
      background: '#21262d',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: '1px solid #30363d'
    },
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

  const renderLessonCard = (lesson, accountType) => {
    const history = historyData[lesson.student];
    const completedCount = history?.completed?.length || 0;
    const totalLessons = history?.package?.includes('4') ? 4 : history?.package?.includes('2') ? 2 : history?.package?.includes('Single') ? 1 : 4;
    const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    return (
      <li key={lesson.id} style={{...styles.lessonCard, ...(accountType === 'austen' ? styles.austenCard : styles.dadCard)}}>
        <div 
          style={styles.studentName}
          onClick={() => handleViewHistory(lesson.student)}
        >
          {lesson.student}
        </div>
        <div style={styles.lessonInfo}>{lesson.date} at {lesson.time} | {lesson.location}</div>
        <div style={styles.lessonInfo}>
          Lesson {lesson.lesson} | Instructor: {lesson.instructor}
          {history && (
            <span> | Package: {history.package}</span>
          )}
        </div>
        
        {/* Progress bar */}
        {history && (
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${progressPercent}%`}}></div>
          </div>
        )}
        
        <div style={styles.actionButtons}>
          <button 
            onClick={() => handleViewHistory(lesson.student)}
            style={{...styles.smallBtn, ...styles.historyBtn}}
          >
            View History
          </button>
          <button 
            onClick={() => handleReschedule(lesson)}
            style={{...styles.smallBtn, ...styles.rescheduleBtn}}
          >
            Reschedule
          </button>
        </div>
      </li>
    );
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Combined Schedule | DVDS</title>
        <style>{`body { margin: 0; background-color: #0d1117; color: #c9d1d9; } html { background-color: #0d1117; }`}</style>
      </Head>
      
      <a href="/" style={styles.backLink}>â† Back to Task Board</a>
      
      <header style={styles.header}>
        <h1>Combined Acuity Dashboard</h1>
        <p>View schedules, lesson history, reschedule, and book new lessons</p>
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
              {filteredSchedule.austen.map((lesson) => renderLessonCard(lesson, 'austen'))}
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
              {filteredSchedule.dad.map((lesson) => renderLessonCard(lesson, 'dad'))}
            </ul>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedStudent && historyData[selectedStudent] && (
        <div style={styles.modal} onClick={() => setShowHistoryModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{selectedStudent} - Lesson History</h3>
            
            {/* Package Info */}
            <div style={styles.packageInfo}>
              <strong>Package:</strong> {historyData[selectedStudent].package}<br/>
              <strong>Completed:</strong> {historyData[selectedStudent].completed.length} lessons<br/>
              <strong>Remaining:</strong> {historyData[selectedStudent].remaining} lessons
            </div>

            {/* Completed Lessons */}
            {historyData[selectedStudent].completed.length > 0 && (
              <div style={styles.historySection}>
                <div style={styles.historyTitle}>Completed Lessons</div>
                {historyData[selectedStudent].completed.map((lesson, idx) => (
                  <div key={idx} style={styles.historyItem}>
                    <div style={styles.historyDate}>
                      Lesson {lesson.lessonNum}: {lesson.date} at {lesson.time}
                    </div>
                    <div style={styles.historyDetails}>
                      Instructor: {lesson.instructor} | Location: {lesson.location}
                    </div>
                    {lesson.notes && (
                      <div style={styles.historyNotes}>Notes: {lesson.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Lessons */}
            {historyData[selectedStudent].upcoming.length > 0 && (
              <div style={styles.historySection}>
                <div style={styles.historyTitle}>Upcoming</div>
                {historyData[selectedStudent].upcoming.map((lesson, idx) => (
                  <div key={idx} style={{...styles.historyItem, borderColor: '#238636'}}>
                    <div style={styles.historyDate}>
                      Lesson {lesson.lessonNum}: {lesson.date} at {lesson.time}
                    </div>
                    <div style={styles.historyDetails}>
                      Instructor: {lesson.instructor} | Location: {lesson.location}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setShowHistoryModal(false)}
                style={{...styles.button, background: '#30363d', color: 'white'}}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              <option value="Allan">Allan</option>
              <option value="Bob">Bob</option>
              <option value="Brandon">Brandon</option>
              <option value="Freddy">Freddy</option>
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