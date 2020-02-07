import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import Spy = jasmine.Spy;
import { ScrollService, ScrollProperties } from './scroll-service';

describe('ScrollServiceService', () => {
  let service: ScrollService;
  beforeEach(() => TestBed.configureTestingModule({}));
  beforeEach(() => {
    service = TestBed.get(ScrollService);

    spyOn(service, 'initScrollForComponent');
    spyOn(service, 'scrollHappened');
    spyOn(service, 'handleScroll');
    spyOn(service, 'cleanupScroll');

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initScroll', () => {
    beforeEach( () => {
      (<Spy>service.initScrollForComponent).and.callThrough();
    });

    it('should set the scroll properties for the component passed in', () => {
      const mockScrollProperties: ScrollProperties = {
        beforeCheckFunc: jasmine.any('Function'),
        checkPassedFunc: jasmine.any('Function'),
        element: null,
      };
      service.initScrollForComponent('testComponent', mockScrollProperties);
      expect(service.handlerList.get('testComponent')).toEqual(mockScrollProperties);
    });
  });

  describe('scrollHappened', () => {
    let mockEvent: any;
    beforeEach( () => {
      (<Spy>service.scrollHappened).and.callThrough();
      mockEvent = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
      };
    });

    it('should trigger a scroll by passing the component as the next in the scroll behavior subject', () => {
      spyOn(service.scroll, 'next');
      service.scrollHappened('testComponent', mockEvent);
      expect(service.scroll.next).toHaveBeenCalledWith('testComponent');
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('handleScroll', () => {
    let mockScrollProperties: ScrollProperties;
    let beforeCheckSpy: Spy;
    let checkPassedSpy: Spy;
    beforeEach( () => {
      (<Spy>service.handleScroll).and.callThrough();
      beforeCheckSpy = jasmine.createSpy('beforeCheckFunc');
      checkPassedSpy = jasmine.createSpy('checkPassedFunc');
      mockScrollProperties = {
        beforeCheckFunc: beforeCheckSpy,
        checkPassedFunc: checkPassedSpy,
        element: {
          scrollHeight: 50,
          clientHeight: 40,
          scrollTop: 0,
        },
      };

      service.handlerList.set('testComponent', mockScrollProperties);
    });

    it('should do nothing if there is no componentName passed in', () => {
      service.handleScroll(null);
      expect(beforeCheckSpy).not.toHaveBeenCalled();
      expect(checkPassedSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if there is no saved handler for the componentName passed in', () => {
      service.handleScroll('some bogus name');
      expect(beforeCheckSpy).not.toHaveBeenCalled();
      expect(checkPassedSpy).not.toHaveBeenCalled();
    });

    it('should call the before function and not call the check passed if we havnt scrolled far enough', () => {
      service.handleScroll('testComponent');
      expect(beforeCheckSpy).toHaveBeenCalled();
      expect(checkPassedSpy).not.toHaveBeenCalled();
    });

    it('should call the before function and call the check passed if we scroll past 70% of the page', () => {
      mockScrollProperties = {
        beforeCheckFunc: beforeCheckSpy,
        checkPassedFunc: checkPassedSpy,
        element: {
          scrollHeight: 50,
          clientHeight: 40,
          scrollTop: 10,
        },
      };

      service.handlerList.set('testComponent2', mockScrollProperties);
      service.handleScroll('testComponent2');
      expect(beforeCheckSpy).toHaveBeenCalled();
      expect(checkPassedSpy).toHaveBeenCalled();
    });

    it('should fall back to other values when element.scrollTop is 0 (for browser support)', () => {
      mockScrollProperties = {
        beforeCheckFunc: beforeCheckSpy,
        checkPassedFunc: checkPassedSpy,
        element: {
          scrollHeight: 50,
          clientHeight: 40,
          scrollTop: 0,
        },
      };
      window.document.body.style.minHeight = '900px';
      window.document.body.style.minWidth = '900px';
      window.scrollTo({ top: 10 });

      service.handlerList.set('testComponent3', mockScrollProperties);
      service.handleScroll('testComponent3');
      expect(window.pageYOffset).toEqual(10);
      expect(document.documentElement.scrollTop).toEqual(10);
      expect(beforeCheckSpy).toHaveBeenCalled();
      expect(checkPassedSpy).toHaveBeenCalled();
    });
  });

  describe('cleanupScroll', () => {
    beforeEach( () => {
      (<Spy>service.cleanupScroll).and.callThrough();
    });

    it('should remove the component passed in from the handler list', () => {
      const mockScrollProperties: ScrollProperties = {
        beforeCheckFunc: jasmine.any('Function'),
        checkPassedFunc: jasmine.any('Function'),
        element: null,
      };
      service.handlerList.set('testComponent', mockScrollProperties);

      service.cleanupScroll('testComponent');

      expect(service.handlerList.get('testComponent')).toBeUndefined();
    });
  });
});
