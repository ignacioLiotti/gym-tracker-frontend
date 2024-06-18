import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/exercises">Exercises</Link></li>
          <li><Link href="/routines">Routines</Link></li>
        </ul>
      </nav>
    </header>
  );
}
