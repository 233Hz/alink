import Sortable from 'sortablejs';

export interface DragAutoScrollerOptions {
  /** 边缘触发距离（px），进入该距离内或超出时触发自动滚动，默认 85px */
  edgeThreshold?: number;
  /** 最大滚动速度（px/frame），默认 24px */
  maxSpeed?: number;
  /** 最小滚动速度（px/frame），默认 5px */
  minSpeed?: number;
}

/**
 * 创建拖拽自动滚动控制器。
 * 专门解决移动端/PC端在拖拽排序时：
 * 1. 手指/光标拖动超出视口或到达容器边缘时，原生/库内滚动中断或不跟手的问题；
 * 2. 手指静止在边缘时，由于没有新的 touchmove 事件导致自动滚动停止的问题；
 * 3. 实时通知 Sortable 更新拖拽占位符，支持极顶/极底插入。
 */
export function createDragAutoScroller(options: DragAutoScrollerOptions = {}) {
  const edgeThreshold = options.edgeThreshold ?? 85;
  const maxSpeed = options.maxSpeed ?? 24;
  const minSpeed = options.minSpeed ?? 5;

  let active = false;
  let scrollContainer: HTMLElement | null = null;
  let originalScrollBehavior = '';
  let rafId: number | null = null;

  let currentX = -1;
  let currentY = -1;

  function updatePointerCoords(e: Event) {
    if (e instanceof TouchEvent) {
      if (e.touches && e.touches.length > 0) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      }
    } else if (e instanceof MouseEvent || e instanceof PointerEvent) {
      currentX = e.clientX;
      currentY = e.clientY;
    }
  }

  function handlePointerMove(e: Event) {
    if (!active) return;
    updatePointerCoords(e);
  }

  function handlePointerEnd() {
    stop();
  }

  let lastVisibleTop = 0;
  let lastVisibleBottom = 0;

  function notifySortable(clampedX: number, clampedY: number) {
    const activeSortable = (Sortable as any).active;
    if (!activeSortable || typeof activeSortable._onDragOver !== 'function') return;

    try {
      let target = document.elementFromPoint(clampedX, clampedY);

      // 如果探测到的元素不在当前活跃容器内（如命中了头部、边框或空白处）
      if (!target || !activeSortable.el.contains(target)) {
        if (currentY <= lastVisibleTop) {
          // 极顶边界：指定容器首个子项
          target = activeSortable.el.firstElementChild;
        } else if (currentY >= lastVisibleBottom) {
          // 极底边界：指定容器末尾子项
          target = activeSortable.el.lastElementChild;
        }
      }

      if (!target) return;

      activeSortable._onDragOver({
        clientX: clampedX,
        clientY: clampedY,
        target: target,
        rootEl: activeSortable.el,
      });
    } catch {
      // 容错处理：某些极端状态下 DOM 变化不中断流程
    }
  }

  function scrollLoop() {
    if (!active || !scrollContainer) {
      rafId = null;
      return;
    }

    if (!scrollContainer.isConnected) {
      stop();
      return;
    }

    if (currentY !== -1) {
      const rect = scrollContainer.getBoundingClientRect();
      const vh = window.innerHeight;

      // 容器在当前视口中的可见顶部和底部边界
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(vh, rect.bottom);
      lastVisibleTop = visibleTop;
      lastVisibleBottom = visibleBottom;
      const visibleHeight = visibleBottom - visibleTop;

      // 动态计算边缘触发宽度（小屏容器自适应缩小，但不小于 40px）
      const effectiveEdge = Math.min(edgeThreshold, Math.max(40, visibleHeight * 0.25));

      const canScrollUp = scrollContainer.scrollTop > 0;
      const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const canScrollDown = scrollContainer.scrollTop < maxScrollTop - 1;

      let scrollDelta = 0;

      // --- 向上滚动判断（手指进入顶部边缘区域 或 超出视口上方） ---
      if (currentY <= visibleTop + effectiveEdge && canScrollUp) {
        if (currentY <= visibleTop) {
          // 已经到达边缘或超出视口/容器上方，全速向上滚动
          scrollDelta = -maxSpeed;
        } else {
          // 在边缘触发区域内，根据接近程度平滑插值提速
          const ratio = (visibleTop + effectiveEdge - currentY) / effectiveEdge;
          scrollDelta = -Math.round(minSpeed + ratio * (maxSpeed - minSpeed));
        }
      }
      // --- 向下滚动判断（手指进入底部边缘区域 或 超出视口下方） ---
      else if (currentY >= visibleBottom - effectiveEdge && canScrollDown) {
        if (currentY >= visibleBottom) {
          // 已经到达边缘或超出视口/容器下方，全速向下滚动
          scrollDelta = maxSpeed;
        } else {
          // 在边缘触发区域内，根据接近程度平滑插值提速
          const ratio = (currentY - (visibleBottom - effectiveEdge)) / effectiveEdge;
          scrollDelta = Math.round(minSpeed + ratio * (maxSpeed - minSpeed));
        }
      }

      if (scrollDelta !== 0) {
        if (scrollDelta < 0) {
          scrollContainer.scrollTop = Math.max(0, scrollContainer.scrollTop + scrollDelta);
        } else {
          scrollContainer.scrollTop = Math.min(maxScrollTop, scrollContainer.scrollTop + scrollDelta);
        }

        // 探测点坐标约束在可见容器区域内（内缩 10px 避免触碰边界缝隙），并通知 Sortable 更新占位符位置
        const probeX = Math.max(rect.left + 10, Math.min(rect.right - 10, currentX > 0 ? currentX : (rect.left + rect.width / 2)));
        const probeY = Math.max(visibleTop + 10, Math.min(visibleBottom - 10, currentY));
        notifySortable(probeX, probeY);
      }
    }

    rafId = requestAnimationFrame(scrollLoop);
  }

  function start(container: HTMLElement | null, initialEvent?: Event | null) {
    stop();
    if (!container) return;

    scrollContainer = container;
    active = true;

    // 禁用平滑滚动动画，确保 requestAnimationFrame 帧同步更新不抖动
    originalScrollBehavior = scrollContainer.style.scrollBehavior;
    scrollContainer.style.scrollBehavior = 'auto';

    if (initialEvent) {
      updatePointerCoords(initialEvent);
    }

    // 全局监听移动与释放事件
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    window.addEventListener('touchend', handlePointerEnd, { passive: true });
    window.addEventListener('touchcancel', handlePointerEnd, { passive: true });
    window.addEventListener('mouseup', handlePointerEnd, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', handlePointerEnd, { passive: true });

    rafId = requestAnimationFrame(scrollLoop);
  }

  function stop() {
    active = false;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (scrollContainer) {
      scrollContainer.style.scrollBehavior = originalScrollBehavior;
      scrollContainer = null;
    }

    currentX = -1;
    currentY = -1;

    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('pointermove', handlePointerMove);

    window.removeEventListener('touchend', handlePointerEnd);
    window.removeEventListener('touchcancel', handlePointerEnd);
    window.removeEventListener('mouseup', handlePointerEnd);
    window.removeEventListener('pointerup', handlePointerEnd);
    window.removeEventListener('pointercancel', handlePointerEnd);
  }

  return {
    start,
    stop,
  };
}
