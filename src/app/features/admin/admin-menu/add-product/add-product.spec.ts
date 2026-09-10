import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import AddProduct from './add-product';

describe('AddProduct', () => {
  let component: AddProduct;
  let fixture: ComponentFixture<AddProduct>;
  let _template: DebugElement;
  let _componentRef: ComponentRef<AddProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProduct],
    }).compileComponents();

    fixture = TestBed.createComponent(AddProduct);
    component = fixture.componentInstance;
    _template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the add-product component', () => {
    expect(component).toBeTruthy();
  });
});
