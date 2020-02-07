import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export class ScrollProperties {
  beforeCheckFunc: () => void;
  checkPassedFunc: () => void;
  element: any;
  scrollTriggerPercentage: number;
}

@Injectable({
  providedIn: 'root',
  useFactory: () => new ScrollService(),
})

/**
 * To use this service, you must do the following:
 *  1) Add the following code to the component you wish to hook into OR hook into the (scroll) in the template.
 *  @HostListener('window:scroll', ['$event'])
 *      onScroll(event: MouseWheelEvent): void {
 *      this.scrollService.scrollHappened();
 *  }
 *
 * 2) Call the init function with the functions to be called when the scroll happens.
 *
 * 3) Add the cleanup to the onDestroy
 */
export class ScrollService  {

  scroll: Subject<string> = new Subject<string>();
  handlerList: Map<string, ScrollProperties> = new Map<string, ScrollProperties>();

  constructor() {
    this.scroll.pipe(debounceTime(100)).subscribe(this.handleScroll);
  }

  /**
   * Configure the scroll listener
   * Should call the before check to handle logic that runs before the scroll check
   * Should call the function set if the scroll check has passed and the action needs to be run.
   */
  initScrollForComponent(component: string, scrollProperties: ScrollProperties): void {
    this.handlerList.set(component, scrollProperties);
  }

  /**
   * The hook in from the component to force a scroll action to happen.
   * We can't directly create host listeners from services, so we rely on the component to do this for us.
   */
  scrollHappened(componentName: string, event: UIEvent): void {
    event.stopPropagation();
    this.scroll.next(componentName);
  }

  /**
   * Handles the scroll subscription and calls functions specified by the component using this service
   */
  handleScroll = (componentName: string): void => {
    // Bail out if there is no component name or no recorded scroll handler functions
    if (!componentName || !this.handlerList.get(componentName)) {
      return;
    }
    const { beforeCheckFunc, checkPassedFunc, element, scrollTriggerPercentage} = this.handlerList.get(componentName);
    // window.pageYoffset when browser doesn't calculate element.scrollTop (mostly safari)
    // document.documentElement.scrollTop and document.body.scrollTop are fallback values
    const currentScrollPos: number = element.scrollTop ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    const totalScroll: number = element.scrollHeight - element.clientHeight;

    beforeCheckFunc();
    // scroll amount is greater than percentage of the page needed to trigger a reload.
    if (currentScrollPos > totalScroll * (scrollTriggerPercentage / 100)) {
      checkPassedFunc();
    }
  }

  /**
   * Cleans up the scroll listener attached to the component
   */
  cleanupScroll(componentName: string): void {
    this.handlerList.delete(componentName);
  }
}
