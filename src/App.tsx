// ============================================================
// SecureDevHub — App shell + hash router
// Routes mirror the classic static site structure:
//   /            → index.html
//   /modules     → modules.html          /module/:id → module-detail.html
//   /checklists  → checklists.html       /tools      → tools.html
//   /blog        → blog.html             /blog/:id   → blog-post.html
//   /playground  → playground.html       /about      → about.html
//   anything else → 404.html
// ============================================================
import { useEffect, useRef } from "react";
import { useHashRoute } from "./lib/utils";
import { BackToTop, Footer, Navbar, SearchHost, ToastHost } from "./components/Chrome";
import Home from "./pages/Home";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import Checklists from "./pages/Checklists";
import Tools from "./pages/Tools";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Playground from "./pages/Playground";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  const route = useHashRoute();
  const mainRef = useRef<HTMLElement>(null);

  // Skip-link target focus support
  useEffect(() => {
    const onSkip = () => {
      mainRef.current?.setAttribute("tabindex", "-1");
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("sdh-skip", onSkip);
    return () => window.removeEventListener("sdh-skip", onSkip);
  }, []);

  let page: React.ReactNode;
  if (route === "/" || route === "") page = <Home />;
  else if (route.startsWith("/module/")) page = <ModuleDetail key={route} id={route.replace("/module/", "").split("#")[0]} />;
  else if (route.startsWith("/modules")) page = <Modules />;
  else if (route.startsWith("/checklists")) page = <Checklists key={route} />;
  else if (route.startsWith("/tools")) page = <Tools />;
  else if (route.startsWith("/blog/")) page = <BlogPost key={route} id={route.replace("/blog/", "")} />;
  else if (route.startsWith("/blog")) page = <Blog />;
  else if (route.startsWith("/playground")) page = <Playground />;
  else if (route.startsWith("/about")) page = <About />;
  else page = <NotFound />;

  return (
    <>
      <button
        className="skip-link"
        onClick={() => window.dispatchEvent(new Event("sdh-skip"))}
        aria-label="Skip to main content"
      >
        Skip to main content
      </button>
      <Navbar route={route} />
      <main id="main-content" ref={mainRef} aria-label="Main content">
        {page}
      </main>
      <Footer />
      <SearchHost />
      <ToastHost />
      <BackToTop />
    </>
  );
}
