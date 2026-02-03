import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AcuityDashboard() {
  const [schedule, setSchedule] = useState({ austen: [], dad: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCombinedSchedule();
  }, []);

  const fetchCombinedSchedule = async () => {
    try {
      // This would fetch from both Acuity accounts via API
      // For now, showing the structure
      const today = new Date().toISOString().split('T')[0];
      
      // Simulated data - in production this comes from your APIs
      const mockData = {
        austen: [
          { student: 'Will Weng', time: '8:30am', instructor: 'Aaron', lesson: '2 of 4', location: 'Tempe' },
          { student: 'Demarious Johnson', time: '8:30am', instructor: 'Ryan', lesson: '2 of 4', location: 'Gilbert' },
          { student: 'Enzo Cascio', time: '2:30pm', instructor: 'Ryan', lesson: '1 of 4', location: 'Scottsdale' },
          { student: 'Alexis Hayes', time: '2:30pm', instructor: 'Austen', lesson: 'Single', location: 'Greenway' },
          { student: 'Thomas Chutes', time: '2:30pm', instructor: 'Aaron', lesson: '1 of 4', location: 'Gilbert' },
          { student: 'Keaton Huls', time: '5:30pm', instructor: 'Ryan', lesson: '1 of 2', location: 'Downtown Phoenix' },
          { student: 'Lily Vaughan', time: '5:30pm', instructor: 'Aaron', lesson: '1 of ?', location: 'Gilbert' }
        ],
        dad: [
          { student: 'Brayden Miller', time: '2:30pm', instructor: 'Ernie', lesson: '1 of 4', location: 'Peoria' }
        ]
      };
      
      setSchedule(mockData);
    } catch (err) {
      setError('Failed to load schedule');
    }
    setLoading(false);
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { borderBottom: '2px solid #30363d', paddingBottom: '10px', marginBottom: '20px' },
    backLink: { color: '#58a6ff', textDecoration: 'none', marginBottom: '10px', display: 'inline-block' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    column: { background: '#161b22', padding: '15px', borderRadius: '8px', border: '1px solid #30363d' },
    columnTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', padding: '10px', background: '#21262d', color: '#c9d1d9', borderRadius: '4px', textAlign: 'center', border: '1px solid #30363d' },
    lessonList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
    lessonCard: { 
      background: '#0d1117', 
      padding: '12px', 
      borderRadius: '6px',
      borderLeft: '4px solid #238636',
      border: '1px solid #30363d'
    },
    austenCard: { borderLeftColor: '#58a6ff' },
    dadCard: { borderLeftColor: '#d29922' },
    studentName: { fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' },
    lessonInfo: { fontSize: '12px', color: '#8b949e', marginBottom: '2px' },
    instructorBadge: { 
      display: 'inline-block', 
      padding: '2px 8px', 
      borderRadius: '4px', 
      fontSize: '11px', 
      fontWeight: 'bold',
      marginTop: '6px'
    },
    austenInstructor: { background: '#1f6feb', color: 'white' },
    dadInstructor: { background: '#d29922', color: 'black' },
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
    empty: { color: '#8b949e', fontStyle: 'italic', padding: '20px', textAlign: 'center' }
  };

  const totalLessons = schedule.austen.length + schedule.dad.length;

  return (
    <div style={styles.container}>
      <Head>
        <title>Combined Schedule | DVDS</title>
        <style>{`body { margin: 0; background-color: #0d1117; color: #c9d1d9; } html { background-color: #0d1117; }`}</style>
      </Head>
      
      <a href="/" style={styles.backLink}>â† Back to Task Board</a>
      
      <header style={styles.header}>
        <h1>Combined Acuity Schedule</h1>
        <p>All instructors across both accounts</p>
      </header>

      {/* Summary */}
      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <div style={styles.summaryNumber}>{totalLessons}</div>
          <div style={styles.summaryLabel}>Total Lessons Today</div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryNumber}>{schedule.austen.length}</div>
          <div style={styles.summaryLabel}>Austen's Team (3 instructors)</div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryNumber}>{schedule.dad.length}</div>
          <div style={styles.summaryLabel}>Dad's Team (6 instructors)</div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div style={styles.grid}>
        {/* Austen's Account */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>Austen's Account (ID: 23214568)</div>
          {schedule.austen.length === 0 ? (
            <div style={styles.empty}>No lessons scheduled</div>
          ) : (
            <ul style={styles.lessonList}>
              {schedule.austen.map((lesson, idx) => (
                <li key={idx} style={{...styles.lessonCard, ...styles.austenCard}}>
                  <div style={styles.studentName}>{lesson.student}</div>
                  <div style={styles.lessonInfo}>â° {lesson.time} | ðŸ“ {lesson.location}</div>
                  <div style={styles.lessonInfo}>Lesson: {lesson.lesson}</div>
                  <span style={{...styles.instructorBadge, ...styles.austenInstructor}}>
                    {lesson.instructor}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dad's Account */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>Dad's Account (ID: 28722957)</div>
          {schedule.dad.length === 0 ? (
            <div style={styles.empty}>No lessons scheduled</div>
          ) : (
            <ul style={styles.lessonList}>
              {schedule.dad.map((lesson, idx) => (
                <li key={idx} style={{...styles.lessonCard, ...styles.dadCard}}>
                  <div style={styles.studentName}>{lesson.student}</div>
                  <div style={styles.lessonInfo}>â° {lesson.time} | ðŸ“ {lesson.location}</div>
                  <div style={styles.lessonInfo}>Lesson: {lesson.lesson}</div>
                  <span style={{...styles.instructorBadge, ...styles.dadInstructor}}>
                    {lesson.instructor}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {loading && <p>Loading schedule...</p>}
      {error && <p style={{color: '#da3633'}}>{error}</p>}
    </div>
  );
}