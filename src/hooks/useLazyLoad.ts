import { useState, useEffect } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for lazy loading components when they come into view
 * @param elementRef Reference to the element to observe
 * @param options Intersection observer options
 * @returns Whether the element is in view
 */
function useLazyLoad(
  elementRef: React.RefObject<Element>,
  options: UseLazyLoadOptions = {}
): boolean {
  const [isInView, setIsInView] = useState<boolean>(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const { threshold = 0.1, rootMargin = '0px' } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Once the element is in view, we can stop observing it
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [elementRef, options]);

  return isInView;
}

export default useLazyLoad;
