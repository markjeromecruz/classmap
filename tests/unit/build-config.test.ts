import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// T-05: Demo-mode static build smoke.
//
// The real `next build` with `NEXT_PUBLIC_DEMO_MODE=true` is exercised on
// every push to main by `.github/workflows/deploy-pages.yml` (live integration
// test: if it fails, deploy fails, and the artifact never reaches Pages).
//
// Here we pin the *contract* at the source level so a config regression
// (someone deletes the demo branch in next.config.ts, the workflow forgets
// to strip the api route, etc.) gets caught locally before push, not at
// deploy time. Running the full build inside vitest would require deleting
// app/classmap/api temporarily — too risky to do automatically.

const nextConfigSource = readFileSync(
  resolve(process.cwd(), "next.config.ts"),
  "utf8",
);

const deployWorkflowSource = readFileSync(
  resolve(process.cwd(), ".github/workflows/deploy-pages.yml"),
  "utf8",
);

describe("next.config.ts — demo-mode toggle", () => {
  it("reads NEXT_PUBLIC_DEMO_MODE from the environment", () => {
    expect(nextConfigSource).toMatch(/NEXT_PUBLIC_DEMO_MODE/);
  });

  it("treats both 'true' and '1' as demo-mode", () => {
    expect(nextConfigSource).toMatch(/NEXT_PUBLIC_DEMO_MODE.*===.*["']true["']/);
    expect(nextConfigSource).toMatch(/NEXT_PUBLIC_DEMO_MODE.*===.*["']1["']/);
  });

  it("flips to static export under demo mode", () => {
    expect(nextConfigSource).toMatch(/output:\s*["']export["']/);
  });

  it("uses trailingSlash + unoptimized images for static hosting under demo mode", () => {
    expect(nextConfigSource).toMatch(/trailingSlash:\s*true/);
    expect(nextConfigSource).toMatch(/unoptimized:\s*true/);
  });

  it("threads NEXT_PUBLIC_BASE_PATH into next config", () => {
    expect(nextConfigSource).toMatch(/NEXT_PUBLIC_BASE_PATH/);
    expect(nextConfigSource).toMatch(/basePath/);
  });
});

describe(".github/workflows/deploy-pages.yml — Pages deploy contract", () => {
  it("triggers on push to main", () => {
    expect(deployWorkflowSource).toMatch(/branches:\s*\[main\]/);
  });

  it("sets NEXT_PUBLIC_DEMO_MODE=true on the build job", () => {
    expect(deployWorkflowSource).toMatch(/NEXT_PUBLIC_DEMO_MODE:\s*["']true["']/);
  });

  it("sets NEXT_PUBLIC_BASE_PATH=/classmap on the build job", () => {
    expect(deployWorkflowSource).toMatch(
      /NEXT_PUBLIC_BASE_PATH:\s*["']\/classmap["']/,
    );
  });

  it("strips app/classmap/api before building (POST handlers can't be statically exported)", () => {
    expect(deployWorkflowSource).toMatch(/rm\s+-rf\s+app\/classmap\/api/);
  });

  it("runs npm run build to produce the static export", () => {
    expect(deployWorkflowSource).toMatch(/npm\s+run\s+build/);
  });

  it("adds .nojekyll so GitHub Pages serves _next assets", () => {
    expect(deployWorkflowSource).toMatch(/touch\s+out\/\.nojekyll/);
  });

  it("uploads the out/ directory as the Pages artifact", () => {
    expect(deployWorkflowSource).toMatch(/upload-pages-artifact/);
    expect(deployWorkflowSource).toMatch(/path:\s*out/);
  });

  it("has a separate deploy job that uses actions/deploy-pages", () => {
    expect(deployWorkflowSource).toMatch(/actions\/deploy-pages/);
  });

  it("grants the Pages-required permissions on the workflow", () => {
    expect(deployWorkflowSource).toMatch(/contents:\s*read/);
    expect(deployWorkflowSource).toMatch(/pages:\s*write/);
    expect(deployWorkflowSource).toMatch(/id-token:\s*write/);
  });
});
