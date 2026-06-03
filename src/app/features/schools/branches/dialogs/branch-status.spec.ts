import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { BranchesService } from '../services/branches';
import { BranchResponse } from '../models/branch';
import { BranchStatusDialogComponent } from './branch-status';

describe('BranchStatusDialogComponent', () => {
  let branchesServiceMock: { updateStatus: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

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
    id: 'b2',
    schoolId: 's1',
    name: 'Downtown Annex',
    code: 'DA-002',
    shortName: 'Downtown',
    description: '',
    email: '',
    phone: '',
    address: '456 City Blvd',
    type: 'SECONDARY',
    status: 'INACTIVE',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  };

  function setupComponent(dialogData: BranchResponse = activeBranch) {
    branchesServiceMock = { updateStatus: vi.fn() };
    dialogRefMock = { close: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BranchStatusDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(BranchStatusDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display current branch name and status', async () => {
    setupComponent(activeBranch);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Main Campus');
    expect(content).toContain('ACTIVE');
  });

  it('should show inactive status when branch is inactive', async () => {
    setupComponent(inactiveBranch);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Downtown Annex');
    expect(content).toContain('INACTIVE');
  });

  it('should call updateStatus with schoolId and branch id on confirm', async () => {
    setupComponent(activeBranch);
    const updatedBranch: BranchResponse = { ...activeBranch, status: 'INACTIVE' };
    branchesServiceMock.updateStatus.mockReturnValue(of(updatedBranch));
    const fixture = await createFixture();

    const confirmButton = fixture.nativeElement.querySelector('button[color="primary"]');
    expect(confirmButton).toBeTruthy();
    confirmButton.click();

    await fixture.whenStable();

    expect(branchesServiceMock.updateStatus).toHaveBeenCalledWith('s1', 'b1');
    expect(dialogRefMock.close).toHaveBeenCalledWith(updatedBranch);
  });

  it('should toggle inactive to active correctly', async () => {
    setupComponent(inactiveBranch);
    const updatedBranch: BranchResponse = { ...inactiveBranch, status: 'ACTIVE' };
    branchesServiceMock.updateStatus.mockReturnValue(of(updatedBranch));
    const fixture = await createFixture();

    const confirmButton = fixture.nativeElement.querySelector('button[color="primary"]');
    confirmButton.click();

    await fixture.whenStable();

    expect(branchesServiceMock.updateStatus).toHaveBeenCalledWith('s1', 'b2');
  });

  it('should close dialog without changes on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const cancelButton = Array.from(buttons as Element[]).find(
      (b) => b.textContent?.trim() === 'Cancel'
    );
    expect(cancelButton).toBeTruthy();
    (cancelButton as HTMLButtonElement).click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(branchesServiceMock.updateStatus).not.toHaveBeenCalled();
  });
});
