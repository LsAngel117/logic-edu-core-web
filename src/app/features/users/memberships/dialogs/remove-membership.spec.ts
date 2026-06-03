import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MembershipsService } from '../services/memberships';
import { RemoveMembershipDialogComponent } from './remove-membership';

describe('RemoveMembershipDialogComponent', () => {
  let membershipsServiceMock: { deactivate: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const dialogData = { userId: 'u1', membershipId: 'm1', role: 'TEACHER' };

  function setupComponent() {
    membershipsServiceMock = { deactivate: vi.fn() };
    dialogRefMock = { close: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [RemoveMembershipDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MembershipsService, useValue: membershipsServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(RemoveMembershipDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display confirmation message with role name', async () => {
    setupComponent();
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('TEACHER');
    expect(content).toContain('Remove');
  });

  it('should call MembershipsService.deactivate on confirm', async () => {
    setupComponent();
    membershipsServiceMock.deactivate.mockReturnValue(of(undefined));
    const fixture = await createFixture();

    const removeButton = fixture.nativeElement.querySelector('button[color="warn"]');
    expect(removeButton).toBeTruthy();
    removeButton.click();

    await fixture.whenStable();

    expect(membershipsServiceMock.deactivate).toHaveBeenCalledWith('m1');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should show error message when service fails', async () => {
    setupComponent();
    membershipsServiceMock.deactivate.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );
    const fixture = await createFixture();

    const removeButton = fixture.nativeElement.querySelector('button[color="warn"]');
    removeButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
  });

  it('should close dialog without changes on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    cancelButton.click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(membershipsServiceMock.deactivate).not.toHaveBeenCalled();
  });
});
