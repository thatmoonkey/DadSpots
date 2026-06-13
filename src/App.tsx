import { Outlet } from 'react-router-dom';

export function App() {
  return (
    <div className="flex h-[100dvh] w-full justify-center bg-black">
      <div className="relative h-full w-full max-w-[440px] overflow-hidden bg-ink-900">
        <Outlet />
      </div>
    </div>
  );
}
