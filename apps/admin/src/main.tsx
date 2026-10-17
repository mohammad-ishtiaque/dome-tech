import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./auth";
import { Shell } from "./components/layout";
import { ToastProvider } from "./components/ui";
import { Login } from "./pages/login";
import { Overview } from "./pages/overview";
import { PagesList, PageEdit } from "./pages/pages";
import { ProductsList, ProductEdit } from "./pages/products";
import { NewsList, NewsEdit } from "./pages/news";
import { JobsList, JobEdit } from "./pages/careers";
import { Inquiries } from "./pages/inquiries";
import { MediaLibrary } from "./pages/media";
import { SettingsPage } from "./pages/settings";
import { Users, Account } from "./pages/users";
import "./styles.css";

// ?capture: no animations or toasts, for screenshots and Figma import (html.to.design).
if (/[?&]capture/.test(location.search)) document.documentElement.classList.add("capture");

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <Shell />,
    children: [
      { index: true, element: <Overview /> },
      { path: "pages", element: <PagesList /> },
      { path: "pages/:id", element: <PageEdit /> },
      { path: "products", element: <ProductsList /> },
      { path: "products/:id", element: <ProductEdit /> },
      { path: "news", element: <NewsList /> },
      { path: "news/:id", element: <NewsEdit /> },
      { path: "careers", element: <JobsList /> },
      { path: "careers/:id", element: <JobEdit /> },
      { path: "inquiries", element: <Inquiries /> },
      { path: "media", element: <MediaLibrary /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "users", element: <Users /> },
      { path: "account", element: <Account /> },
      { path: "*", element: <div className="empty">Page not found.</div> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
