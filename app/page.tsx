import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {

  return (
    <div>
      <h1>Welcome to Gym Tracker</h1>
      <nav>
        <ul>
          <li><Link href="/exercises">Exercises</Link></li>
          <li><Link href="/routines">Routines</Link></li>
        </ul>
      </nav>
    </div>
  );
}
