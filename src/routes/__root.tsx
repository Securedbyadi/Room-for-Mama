import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ButtonMain, Drawing, Page } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";

function NotFoundComponent() {
  return (
    <Page>
      <Drawing name="illo-tea-cold" />
      <div>
        <h1 className="t-title">This page isn’t here.</h1>
        <p className="mt-2 text-ink-muted">Let’s get you back.</p>
      </div>
      <div className="mt-auto flex flex-col gap-4 pt-4">
        <Link to="/" className="block">
          <ButtonMain>Back to home</ButtonMain>
        </Link>
        <SafetyNote />
      </div>
    </Page>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <Page>
      <Drawing name="illo-tea-cold" />
      <div>
        <h1 className="t-title">Something went quiet on my side.</h1>
        <p className="mt-2 text-ink-muted">Try again in a moment.</p>
      </div>
      <div className="mt-auto flex flex-col gap-4 pt-4">
        <ButtonMain
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </ButtonMain>
        <SafetyNote />
      </div>
    </Page>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Room for Mama" },
      {
        name: "description",
        content:
          "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.",
      },
      { property: "og:title", content: "Room for Mama" },
      {
        property: "og:description",
        content:
          "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#F6EEE3" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/brand/logo/rfm-favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/brand/logo/png/rfm-app-icon-180.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,100,1;1,9..144,100..900,100,1&family=Figtree:wght@400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
