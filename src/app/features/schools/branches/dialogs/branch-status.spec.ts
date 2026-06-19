import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of } from 'rxjs';
import { BranchesService } from '../services/branches';
import { BranchResponse } from '../models/branch';
import { BranchStatusDialog } from './branch-status';

describe('BranchStatusDialog', () => {
  let branchesServiceMock: { updateStatus: ReturnType<typeof vi.fn> };

  const activeBranch: BranchResponse = {
    id: 'b1',
    schoolId: 's1',
    name: 'Main Campus',
    code: 'MC-001',
    shortName: 'Main',
    description: '',
    email: '',
    phone: '',
    address: '123 Campus Dr',
    type: 'MAIN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const inactiveBranch: BranchResponse = {
    ...activeBranch,
    id: 'b2',
    name: 'Downtown Annex',
    code: 'DA-002',
    status: 'INACTIVE',
  };

  function setupComponent() {
    branchesServiceMock = { updateStatus: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BranchStatusDialog],
      providers: [
        provideAnimationsAsync(),
        { provide: BranchesService, useValue: branchesServiceMock },
      ],
    });
  }

  async function createFixture(branch: BranchResponse = activeBranch) {
    const fixture = await TestBed.createComponent(BranchStatusDialog);
    fixture.componentRef.setInput('branch', branch);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute correct title and message for ACTIVE branch', async () => {
    setupComponent();
    const fixture = await createFixture(activeBranch);

    const comp = fixture.componentInstance;
    expect(comp.statusTitle()).toBe('Desactivar sede');
    expect(comp.statusMessage()).toContain('desactivar');
    expect(comp.statusMessage()).toContain('Main Campus');
    expect(comp.confirmLabel()).toBe('Desactivar');
  });

  it('should compute correct title and message for INACTIVE branch', async () => {
    setupComponent();
    const fixture = await createFixture(inactiveBranch);

    const comp = fixture.componentInstance;
    expect(comp.statusTitle()).toBe('Activar sede');
    expect(comp.statusMessage()).toContain('activar');
    expect(comp.statusMessage()).toContain('Downtown Annex');
    expect(comp.confirmLabel()).toBe('Activar');
  });

  it('should call updateStatus with schoolId and branch id on confirm', async () => {
    setupComponent();
    const updatedBranch: BranchResponse = { ...activeBranch, status: 'INACTIVE' };
    branchesServiceMock.updateStatus.mockReturnValue(of(updatedBranch));
    const fixture = await createFixture(activeBranch);

    const comp = fixture.componentInstance;
    comp.visible.set(true);
    fixture.detectChanges();

    await comp.onConfirm();
    await fixture.whenStable();

    expect(branchesServiceMock.updateStatus).toHaveBeenCalledWith('s1', 'b1');
  });

  it('should toggle inactive to active correctly', async () => {
    setupComponent();
    const updatedBranch: BranchResponse = { ...inactiveBranch, status: 'ACTIVE' };
    branchesServiceMock.updateStatus.mockReturnValue(of(updatedBranch));
    const fixture = await createFixture(inactiveBranch);

    const comp = fixture.componentInstance;
    comp.visible.set(true);
    fixture.detectChanges();

    await comp.onConfirm();
    await fixture.whenStable();

    expect(branchesServiceMock.updateStatus).toHaveBeenCalledWith('s1', 'b2');
  });

  it('should close dialog without changes on cancel', async () => {
    setupComponent();
    const fixture = await createFixture(activeBranch);

    const comp = fixture.componentInstance;
    comp.visible.set(true);
    fixture.detectChanges();

    comp.onCancel();

    expect(comp.visible()).toBe(false);
    expect(branchesServiceMock.updateStatus).not.toHaveBeenCalled();
  });
});
