import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

type SketchViewerRoot = HTMLElement & {
  dataset: DOMStringMap & {
    sketchMounted?: string;
    sketchSource?: string;
  };
};

type SketchApi = Parameters<
  NonNullable<React.ComponentProps<typeof Excalidraw>['excalidrawAPI']>
>[0];
type ZoomValue = ReturnType<SketchApi['getAppState']>['zoom']['value'];

const asZoomValue = (value: number) => value as ZoomValue;

const getSiteTheme = (): 'light' | 'dark' =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

function mountSketchViewer(root: SketchViewerRoot) {
  if (root.dataset.sketchMounted === 'true') return;
  root.dataset.sketchMounted = 'true';

  const canvas = root.querySelector<HTMLElement>('[data-sketch-canvas]');
  const loading = root.querySelector<HTMLElement>('[data-sketch-loading]');
  const source = root.dataset.sketchSource;
  if (!canvas || !source) return;

  let api: SketchApi | undefined;

  const previewChromeSelectors = [
    '.layer-ui__wrapper',
    '.layer-ui__wrapper__footer',
    '.App-bottom-bar',
    '.App-menu_bottom',
    '.mobile-misc-tools-container',
  ];
  const syncPreviewChrome = () => {
    if (root.dataset.sketchMode !== 'preview') return;

    const shouldHide = document.fullscreenElement !== root;
    previewChromeSelectors.forEach((selector) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (shouldHide) {
          element.style.setProperty('display', 'none', 'important');
        } else {
          element.style.removeProperty('display');
        }
      });
    });
  };

  const schedulePreviewChromeSync = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(syncPreviewChrome);
    });
  };

  // Excalidraw can mount its responsive footer after the initial React paint.
  // Keep preview cards free of editor chrome even when that delayed mount
  // happens; fullscreenchange restores it for the full viewer.
  if (root.dataset.sketchMode === 'preview') {
    new MutationObserver(schedulePreviewChromeSync).observe(canvas, {
      childList: true,
      subtree: true,
    });
  }

  const handleWheel = (event: WheelEvent) => {
    if (!api) return;

    event.preventDefault();
    event.stopPropagation();

    const multiplier =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
    const nextZoom = api.getAppState().zoom.value * Math.pow(1.0015, -event.deltaY * multiplier);

    api.updateScene({
      appState: {
        zoom: { value: asZoomValue(Math.max(0.1, Math.min(3, nextZoom))) },
      },
    });
  };
  canvas.addEventListener('wheel', handleWheel, { capture: true, passive: false });

  const fitToSketch = () => {
    if (!api) return;
    api.scrollToContent(undefined, {
      fitToViewport: true,
      viewportZoomFactor: 0.82,
      animate: false,
    });
  };

  const scheduleFit = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(fitToSketch);
    });
  };

  const fullscreenButton = root.querySelector<HTMLButtonElement>('[data-sketch-fullscreen]');
  const syncFullscreenButton = () => {
    if (!fullscreenButton) return;

    const isFullscreen = document.fullscreenElement === root;
    fullscreenButton.classList.toggle('is-fullscreen', isFullscreen);
    fullscreenButton.setAttribute(
      'aria-label',
      isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen',
    );
    fullscreenButton.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
    fullscreenButton.setAttribute('aria-pressed', String(isFullscreen));
  };

  if (!document.fullscreenEnabled || !root.requestFullscreen) {
    fullscreenButton?.setAttribute('disabled', 'true');
  } else {
    fullscreenButton?.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === root) {
          await document.exitFullscreen();
        } else {
          await root.requestFullscreen();
        }
        api?.refresh();
        scheduleFit();
      } catch {
        // Fullscreen can be rejected by the browser or embedding context.
      }
      syncFullscreenButton();
    });
  }

  const handleFullscreenChange = () => {
    if (!document.documentElement.contains(root)) {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      return;
    }
    syncFullscreenButton();
    syncPreviewChrome();
  };
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  syncFullscreenButton();

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`Sketch source failed: ${response.status}`);
      return response.json();
    })
    .then((scene) => {
      const theme = getSiteTheme();
      const component = React.createElement(Excalidraw, {
        initialData: {
          ...scene,
          appState: {
            ...(scene.appState ?? {}),
            theme,
          },
        },
        theme,
        viewModeEnabled: true,
        zenModeEnabled: true,
        renderTopRightUI: () => null,
        UIOptions: {
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
            export: false,
            loadScene: false,
            saveAsImage: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        },
        excalidrawAPI: (instance) => {
          api = instance;
          scheduleFit();
        },
      });

      createRoot(canvas).render(component);
      loading?.remove();
      schedulePreviewChromeSync();
      if (root.dataset.sketchMode === 'preview') {
        // The preview-only chrome is removed after Excalidraw's first paint.
        // Fit once more after that layout settles so previews open on the
        // content rather than inheriting the source scene's camera.
        scheduleFit();
      }

      const themeObserver = new MutationObserver(() => {
        if (!document.documentElement.contains(root)) {
          themeObserver.disconnect();
          return;
        }
        api?.updateScene({ appState: { theme: getSiteTheme() } });
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    })
    .catch((error: unknown) => {
      console.error('Unable to load sketch', error);
      if (loading) loading.textContent = 'This sketch could not be loaded right now.';
      root.dataset.sketchError = 'true';
    });
}

function initSketchViewers() {
  document.querySelectorAll<SketchViewerRoot>('[data-sketch-viewer]').forEach(mountSketchViewer);
}

initSketchViewers();
document.addEventListener('astro:page-load', initSketchViewers);
