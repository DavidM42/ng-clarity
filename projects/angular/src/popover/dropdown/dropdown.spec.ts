/*
 * Copyright (c) 2016-2023 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { FocusService } from '../../utils/focus/focus.service';
import { FocusableItem } from '../../utils/focus/focusable-item/focusable-item';
import { ClrPopoverToggleService } from '../../utils/popover/providers/popover-toggle.service';
import { ClrDropdown } from './dropdown';
import { ClrDropdownModule } from './dropdown.module';
import { DropdownFocusHandler } from './providers/dropdown-focus-handler.service';

export default function (): void {
  describe('Dropdown', () => {
    let fixture: ComponentFixture<any>;
    let compiled: any;
    let subscription: Subscription;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [ClrDropdownModule], declarations: [TestComponent] });

      fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      compiled = fixture.nativeElement;
    });

    afterEach(() => {
      fixture.destroy();

      if (subscription) {
        subscription.unsubscribe();
      }
    });

    it('projects content', () => {
      expect(compiled.textContent).toMatch(/Dropdown/);
    });

    it('adds the .dropdown class on clr-dropdown', () => {
      expect(compiled.querySelector('.dropdown')).not.toBeNull();
    });

    it('adds the .dropdown-toggle class on clrDropdownTrigger', () => {
      const dropdownToggle: HTMLElement = compiled.querySelector('[clrDropdownTrigger]');
      expect(dropdownToggle.classList.contains('.dropdown-toggle'));
    });

    it('adds the .dropdown-item class on clrDropdownItem', () => {
      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');
      dropdownToggle.click();
      // detect the click
      fixture.detectChanges();

      const dropdownItem: HTMLElement = compiled.querySelector('[clrDropdownItem]');
      expect(dropdownItem.classList.contains('.dropdown-item'));
    });

    it('toggles the menu when clicked on the host', () => {
      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');

      expect(compiled.querySelector('.dropdown-item')).toBeNull();
      dropdownToggle.click();
      // detect the click
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).not.toBeNull();

      // click the dropdown toggle again to close the menu
      dropdownToggle.click();
      // detect the click
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).toBeNull();
    });

    it('toggles the nested menu when clicked on the toggle', () => {
      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');
      dropdownToggle.click();
      // detect the click
      fixture.detectChanges();

      const nestedToggle: HTMLElement = compiled.querySelector('.nested');
      expect(compiled.textContent.trim()).not.toMatch('Foo');
      nestedToggle.click();
      // detect the click
      fixture.detectChanges();
      expect(compiled.textContent.trim()).toMatch('Foo');

      // click the nested toggle again to close the menu
      nestedToggle.click();
      // detect the click
      fixture.detectChanges();
      expect(compiled.textContent.trim()).not.toMatch('Foo');
    });

    it('closes the menu when clicked outside of the host', fakeAsync(() => {
      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');
      const outsideButton: HTMLElement = compiled.querySelector('.outside-click-test');

      // check if the dropdown is closed
      expect(compiled.querySelector('.dropdown-item')).toBeNull();

      // click outside the dropdown
      outsideButton.click();
      fixture.detectChanges();

      // check if the click handler is triggered
      expect(fixture.componentInstance.testCnt).toEqual(1);
      // check if the open class is added
      expect(compiled.querySelector('.dropdown-item')).toBeNull();

      // click on the dropdown
      dropdownToggle.click();
      tick();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).not.toBeNull();

      // click outside the dropdown
      outsideButton.click();
      fixture.detectChanges();

      // check if the click handler is triggered
      expect(fixture.componentInstance.testCnt).toEqual(2);
      // check if the open class is added
      expect(compiled.querySelector('.dropdown-item')).toBeNull();
    }));

    it('supports clrMenuClosable option. Closes the dropdown menu when clrMenuClosable is set to true', fakeAsync(() => {
      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');
      dropdownToggle.click();
      fixture.detectChanges();

      const dropdownItem: HTMLElement = compiled.querySelector('.dropdown-item');

      dropdownItem.click();
      tick();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).toBeNull();

      fixture.componentInstance.menuClosable = false;
      dropdownToggle.click();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).not.toBeNull();

      dropdownItem.click();
      tick();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).not.toBeNull();
    }));

    it('closes all dropdown menus when clrMenuClosable is true', fakeAsync(() => {
      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');
      dropdownToggle.click();
      fixture.detectChanges();

      const nestedToggle: HTMLElement = compiled.querySelector('.nested');
      nestedToggle.click();

      fixture.detectChanges();

      const nestedItem: HTMLElement = compiled.querySelector('.nested-item');
      nestedItem.click();
      tick();

      fixture.detectChanges();

      const items: HTMLElement = compiled.querySelector('.dropdown-item');
      expect(items).toBeNull();
    }));

    it('does not close the menu when a disabled item is clicked', fakeAsync(() => {
      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');
      dropdownToggle.click();
      fixture.detectChanges();

      const disabledDropdownItem: HTMLElement = compiled.querySelector('.dropdown-item.disabled');
      const dropdownItem: HTMLElement = compiled.querySelector('.dropdown-item');

      disabledDropdownItem.click();
      tick();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).not.toBeNull();

      dropdownItem.click();
      tick();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-item')).toBeNull();
    }));

    it("doesn't close before custom click events have triggered", fakeAsync(function () {
      const toggleService = fixture.debugElement.query(By.directive(ClrDropdown)).injector.get(ClrPopoverToggleService);

      const dropdownToggle: HTMLElement = compiled.querySelector('.dropdown-toggle');
      dropdownToggle.click();
      fixture.detectChanges();

      const nestedToggle: HTMLElement = compiled.querySelector('.nested');
      nestedToggle.click();
      fixture.detectChanges();

      subscription = toggleService.openChange.subscribe(() => {
        expect(fixture.componentInstance.customClickHandlerDone).toBe(true);
      });

      const nestedItem: HTMLElement = compiled.querySelector('.nested-item');
      nestedItem.click();
      tick();
      fixture.detectChanges();

      // Make sure the dropdown correctly closed, otherwise our expect() in the subscription might not have run.
      expect(toggleService.open).toBe(false);
    }));

    it('declares a FocusService provider', () => {
      const focusService = fixture.debugElement.query(By.directive(ClrDropdown)).injector.get(FocusService, null);
      expect(focusService).not.toBeNull();
    });

    it('declares a DropdownFocusHandler provider', () => {
      const injector = fixture.debugElement.query(By.directive(ClrDropdown)).injector;
      const focusHandler = injector.get(DropdownFocusHandler, null);
      expect(focusHandler).not.toBeNull();
      expect(injector.get(FocusableItem, null)).toBe(focusHandler);
    });
  });
}

@Component({
  template: `
    <button class="outside-click-test" (click)="outsideButtonClickHandler()">
      Button to test clicks outside of the dropdown component
    </button>
    <clr-dropdown [clrCloseMenuOnItemClick]="menuClosable">
      <button class="btn btn-primary" type="button" clrDropdownTrigger>
        Dropdown
        <cds-icon shape="angle" direction="down"></cds-icon>
      </button>
      <clr-dropdown-menu *clrIfOpen>
        <label class="dropdown-header">Header</label>
        <a href="javascript://" clrDropdownItem>Item</a>
        <a href="javascript://" clrDisabled="true" clrDropdownItem>Disabled Item</a>
        <clr-dropdown>
          <button clrDropdownTrigger class="nested">Nested</button>
          <clr-dropdown-menu *clrIfOpen>
            <a href="javascript://" clrDropdownItem class="nested-item" (click)="customClickHandler()">Foo</a>
          </clr-dropdown-menu>
        </clr-dropdown>
      </clr-dropdown-menu>
    </clr-dropdown>
  `,
})
class TestComponent {
  @ViewChild(ClrDropdown) dropdownInstance: ClrDropdown;

  menuClosable = true;
  testCnt = 0;

  outsideButtonClickHandler(): void {
    this.testCnt++;
  }

  customClickHandlerDone = false;
  customClickHandler() {
    this.customClickHandlerDone = true;
  }
}
