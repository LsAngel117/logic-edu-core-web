import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { BranchesService } from '../services/branches';
import { Branch } from '../models/branch';
import { BranchStatusDialogComponent } from './branch-status';

describe('BranchStatusDialogComponent', () => {
  let branchesServiceMock: { updateStatus: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const activeBranch: Branch = {
    id: 'b1',
    schoolId: 's1',
    name: 'Main Campus',
    code: 'MC-001',
    address: '123 Campus Dr',
    status: 'active',
  };

  const inactiveBranch: Branch = {
    id: 'b2',
    schoolId: 's1',
    name: 'Downtown Annex',
    code: 'DA-002',
    address: '456 City Blvd',
    status: 'inactive',
  };

  function setupComponent(dialogData: Branch = activeBranch) {
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
    expect(content).toContain('active');
  });

  it('should show inactive status when branch is inactive', async () => {
    setupComponent(inactiveBranch);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Downtown Annex');
    expect(content).toContain('inactive');
  });

  it('should call updateStatus with toggled value on confirm', async () => {
    setupComponent(activeBranch);
    const updatedBranch: Branch = { ...activeBranch, status: 'inactive' };
    branchesServiceMock.updateStatus.mockReturnValue(of(updatedBranch));
    const fixture = await createFixture();

    const confirmButton = fixture.nativeElement.querySelector('button[color="primary"]');
    expect(confirmButton).toBeTruthy();
    confirmButton.click();

    await fixture.whenStable();

    expect(branchesServiceMock.updateStatus).toHaveBeenCalledWith('b1', { status: 'inactive' });
    expect(dialogRefMock.close).toHaveBeenCalledWith(updatedBranch);
  });

  it('should toggle active to inactive correctly', async () => {
    setupComponent(inactiveBranch);
    const updatedBranch: Branch = { ...inactiveBranch, status: 'active' };
    branchesServiceMock.updateStatus.mockReturnValue(of(updatedBranch));
    const fixture = await createFixture();

    const confirmButton = fixture.nativeElement.querySelector('button[color="primary"]');
    confirmButton.click();

    await fixture.whenStable();

    expect(branchesServiceMock.updateStatus).toHaveBeenCalledWith('b2', { status: 'active' });
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
