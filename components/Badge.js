export default function Badge({ status }) {
  const styles = {
    breaking: { background: '#FCEBEB', color: '#A32D2D' },
    warning:  { background: '#FAEEDA', color: '#854F0B' },
    clean:    { background: '#EAF3DE', color: '#3B6D11' },
    impacted: { background: '#FAEEDA', color: '#854F0B' },
    stale:    { background: '#FCEBEB', color: '#A32D2D' },
    modified: { background: '#FCEBEB', color: '#A32D2D' },
  }
  const s = styles[status] || styles.clean
  return (
    <span style={{
      ...s,
      fontSize: 11, padding: '3px 10px',
      borderRadius: 20, fontWeight: 500
    }}>
      {status}
    </span>
  )
}