/**
 * 共享的视口可见性观察器
 *
 * 图标使用 `loading="lazy"`，屏幕外的图片浏览器根本不会发起请求。
 * 若此时就开始计算「候选超时」，离屏卡片会在用户滚动到之前把整条
 * 兜底链路白白耗尽，最终永远只剩生成图标。
 * 因此超时计时必须只针对真正进入视口的元素。
 */

type VisibilityCallback = (visible: boolean) => void;

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, VisibilityCallback>();

function getObserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === 'undefined') return null;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const callback = callbacks.get(entry.target);
        if (callback) callback(entry.isIntersecting);
      }
    },
    // 提前 200px 判定为可见，与懒加载的预取距离保持接近
    { rootMargin: '200px' }
  );
  return observer;
}

/**
 * 监听元素可见性，返回取消监听的函数。
 * 环境不支持 IntersectionObserver 时按「始终可见」处理，保证功能不丢失。
 */
export function observeVisibility(element: Element, callback: VisibilityCallback): () => void {
  const instance = getObserver();
  if (!instance) {
    callback(true);
    return () => {};
  }

  callbacks.set(element, callback);
  instance.observe(element);

  return () => {
    callbacks.delete(element);
    instance.unobserve(element);
  };
}
