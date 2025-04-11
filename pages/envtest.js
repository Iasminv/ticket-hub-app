export default function EnvTest() {
    return (
      <div>
        <h1>Env Test</h1>
        <p>API: {process.env.NEXT_PUBLIC_API_URL}</p>
      </div>
    );
  }