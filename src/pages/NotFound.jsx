import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card mx-auto mt-10 max-w-md text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="muted mt-2 text-sm">This address does not match any page in the dashboard.</p>
      <Link to="/" className="btn mt-5">Back to dashboard</Link>
    </div>
  );
}
