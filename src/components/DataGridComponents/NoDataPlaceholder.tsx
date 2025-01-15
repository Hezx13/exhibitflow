const NoDataPlaceholder = ({ children }) => {
  return (
    <div
      style={{
        height: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2 style={{ color: '#fff' }}>[No data available]</h2>
      <div>{children}</div>
    </div>
  );
};

export default NoDataPlaceholder;
