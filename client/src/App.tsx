import { lazy, Suspense, type ReactNode } from 'react';
import { SiteLayout } from '@/components/layout';
import { match, useLocation, usePathname, useScrollOnNavigate } from '@/lib/router';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import { Perfumery, Technology } from '@/pages/Division';
import Home from '@/pages/Home';
import Privacy from '@/pages/Privacy';
import Work from '@/pages/Work';
import WorkDetail, { NotFound } from '@/pages/WorkDetail';

// The admin is split off so public visitors never download it.
const AdminShell = lazy(() => import('@/components/admin-shell'));
const Login = lazy(() => import('@/pages/admin/Login'));
const Inbox = lazy(() => import('@/pages/admin/Inbox'));
const Message = lazy(() => import('@/pages/admin/Message'));
const Projects = lazy(() => import('@/pages/admin/Projects'));
const ProjectForm = lazy(() => import('@/pages/admin/ProjectForm'));

const PUBLIC: Record<string, () => ReactNode> = {
  '/': () => <Home />,
  '/about': () => <About />,
  '/perfumery': () => <Perfumery />,
  '/technology': () => <Technology />,
  '/work': () => <Work />,
  '/contact': () => <Contact />,
  '/privacy': () => <Privacy />,
};

function adminPage(path: string): ReactNode | null {
  if (path === '/admin' || path === '/admin/inbox') return <Inbox />;
  if (path === '/admin/projects') return <Projects />;
  if (path === '/admin/projects/new') return <ProjectForm key="new" />;
  let params = match('/admin/inbox/:id', path);
  if (params) return <Message id={params.id} />;
  params = match('/admin/projects/:id', path);
  if (params) return <ProjectForm key={params.id} id={params.id} />;
  return null;
}

export default function App() {
  const location = useLocation();
  const path = usePathname().replace(/\/+$/, '') || '/';
  useScrollOnNavigate(location.split('?')[0]);

  if (path === '/admin/login') {
    return (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    );
  }
  if (path.startsWith('/admin')) {
    return (
      <Suspense fallback={null}>
        <AdminShell>
          <Suspense fallback={<div className="ph" style={{ height: 320 }} aria-busy="true" />}>{adminPage(path) ?? <NotFound />}</Suspense>
        </AdminShell>
      </Suspense>
    );
  }

  const slug = match('/work/:slug', path)?.slug;
  const page = slug ? <WorkDetail key={slug} slug={slug} /> : (PUBLIC[path]?.() ?? <NotFound />);
  return <SiteLayout>{page}</SiteLayout>;
}
