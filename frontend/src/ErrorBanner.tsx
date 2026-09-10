function ErrorBanner({ title, description = undefined }: {title: string, description?: string}) {
  return (
    <div style={{
      fontWeight: 'bold',
      boxSizing: 'content-box',
      padding: "15px",
      border: "solid darkred 5px",
      borderRadius: "5px",
      backgroundColor: "indianred",
    }}>
      <b>
        <h1>ERROR: {title}</h1>
        {description && <p>{description}</p>}
      </b>
    </div>
  )
}

export default ErrorBanner;
