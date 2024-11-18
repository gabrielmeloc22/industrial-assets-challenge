"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Loading } from "../ui/loading";

type WithSuspenseOpts = {
  fallback?: React.ReactNode;
};

export function withSuspense<TProps>(
  component: FC<TProps>,
  opts?: WithSuspenseOpts
) {
  const Component = component;

  const componentWithSuspense = (props: TProps) => (
    <Suspense fallback={opts?.fallback || <Loading layout={true} />}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
              <Card>
                <Button onClick={resetErrorBoundary}>
                  An error occurred, please try again!
                </Button>
              </Card>
            )}
          >
            <Component {...props} />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </Suspense>
  );

  return componentWithSuspense;
}
