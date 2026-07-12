import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { StructuresService } from '../services/structures';
import { CreateStructureDialogComponent } from './create-structure';

describe('CreateStructureDialogComponent', () => {
  let structuresServiceMock: { create: ReturnType<typeof vi.fn> };

  function setupComponent() {
    structuresServiceMock = { create: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreateStructureDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: StructuresService, useValue: structuresServiceMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(CreateStructureDialogComponent);
    // Set required input
    fixture.componentRef.setInput('schoolId', 'sch1');
    // Set visible to true so dialog content renders
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Form rendering ---

  it('should render form with all required fields', async () => {
    setupComponent();
    const fixture = await createFixture();

    const typeSelect = fixture.nativeElement.querySelector('[formcontrolname="structureType"]');
    const levelsInput = fixture.nativeElement.querySelector('[formcontrolname="levelsCount"]');
    const periodsInput = fixture.nativeElement.querySelector('[formcontrolname="periodsPerLevel"]');
    const evalPeriodsInput = fixture.nativeElement.querySelector('[formcontrolname="evaluationPeriodsPerPeriod"]');
    const subjectsInput = fixture.nativeElement.querySelector('[formcontrolname="subjectsPerPeriod"]');
    const hoursInput = fixture.nativeElement.querySelector('[formcontrolname="hoursPerSubject"]');

    expect(typeSelect).toBeTruthy();
    expect(levelsInput).toBeTruthy();
    expect(periodsInput).toBeTruthy();
    expect(evalPeriodsInput).toBeTruthy();
    expect(subjectsInput).toBeTruthy();
    expect(hoursInput).toBeTruthy();
  });

  it('should render app-dialog', async () => {
    setupComponent();
    const fixture = await createFixture();

    const dialog = fixture.nativeElement.querySelector('app-dialog');
    expect(dialog).toBeTruthy();
  });

  // --- Validation ---

  it('should not call service when form is invalid (structureType not selected)', async () => {
    setupComponent();
    const fixture = await createFixture();

    const instance = fixture.componentInstance;
    // Form has defaults but structureType is empty (required)
    await instance.onSubmit();

    expect(structuresServiceMock.create).not.toHaveBeenCalled();
  });

  // --- Successful submit ---

  it('should call StructuresService.create with correct payload when form is valid', async () => {
    setupComponent();
    structuresServiceMock.create.mockReturnValue(
      of({
        id: 'new1',
        schoolId: 'sch1',
        structureType: 'PRIMARIA',
        levelsCount: 6,
        periodsPerLevel: 4,
        evaluationPeriodsPerPeriod: 3,
        subjectsPerPeriod: 8,
        hoursPerSubject: 2,
        active: true,
        version: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }),
    );

    const fixture = await createFixture();

    const instance = fixture.componentInstance;
    instance.form.patchValue({
      structureType: 'PRIMARIA',
      levelsCount: 6,
      periodsPerLevel: 4,
      evaluationPeriodsPerPeriod: 3,
      subjectsPerPeriod: 8,
      hoursPerSubject: 2,
    });

    await instance.onSubmit();

    expect(structuresServiceMock.create).toHaveBeenCalledWith('sch1', {
      structureType: 'PRIMARIA',
      levelsCount: 6,
      periodsPerLevel: 4,
      evaluationPeriodsPerPeriod: 3,
      subjectsPerPeriod: 8,
      hoursPerSubject: 2,
    });
  });

  // --- Error handling ---

  it('should show error message when service fails', async () => {
    setupComponent();
    structuresServiceMock.create.mockReturnValue(throwError(() => new Error('Error al crear')));

    const fixture = await createFixture();

    const instance = fixture.componentInstance;
    instance.form.patchValue({
      structureType: 'PRIMARIA',
      levelsCount: 6,
      periodsPerLevel: 4,
      evaluationPeriodsPerPeriod: 3,
      subjectsPerPeriod: 8,
      hoursPerSubject: 2,
    });

    await instance.onSubmit();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.field-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Error al crear');
  });

  // --- Triangulation: Different structure types ---

  it('should send SECUNDARIA type correctly', async () => {
    setupComponent();
    structuresServiceMock.create.mockReturnValue(of({
      id: 'new2',
      schoolId: 'sch1',
      structureType: 'SECUNDARIA',
      levelsCount: 4,
      periodsPerLevel: 2,
      evaluationPeriodsPerPeriod: 2,
      subjectsPerPeriod: 6,
      hoursPerSubject: 3,
      active: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }));

    const fixture = await createFixture();
    const instance = fixture.componentInstance;
    instance.form.patchValue({
      structureType: 'SECUNDARIA',
      levelsCount: 4,
      periodsPerLevel: 2,
      evaluationPeriodsPerPeriod: 2,
      subjectsPerPeriod: 6,
      hoursPerSubject: 3,
    });

    await instance.onSubmit();

    expect(structuresServiceMock.create).toHaveBeenCalledWith('sch1', expect.objectContaining({
      structureType: 'SECUNDARIA',
      levelsCount: 4,
    }));
  });
});
