import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component } from '@angular/core';
import { DataTable } from './data-table';
import { TableColumn, TableAction, SortEvent, PageEvent, RowActionEvent } from '../models';

type TestRow = Record<string, unknown> & {
  id: number;
  name: string;
  email: string;
  status?: string;
};

const columns: TableColumn<TestRow>[] = [
  { key: 'id', label: 'ID', sortable: false },
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo', sortable: true },
  { key: 'status', label: 'Estado', sortable: false },
];

const sampleData: TestRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active' },
  { id: 2, name: 'Bob', email: 'bob@example.com', status: 'inactive' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', status: 'active' },
];

const actions: TableAction[] = [
  { icon: 'pencil', label: 'Editar', action: 'edit' },
  { icon: 'trash2', label: 'Eliminar', action: 'delete' },
];

/** Test host to bind inputs via template */
@Component({
  standalone: true,
  imports: [DataTable],
  template: `
    <app-data-table
      [columns]="hostColumns"
      [data]="hostData"
      [actions]="hostActions"
      [pageSize]="hostPageSize"
      [loading]="hostLoading"
      (sortChange)="onSort($event)"
      (pageChange)="onPage($event)"
      (rowAction)="onRowAction($event)"
    />
  `,
})
class TestHost {
  hostColumns = columns;
  hostData = sampleData;
  hostActions = actions;
  hostPageSize = 2;
  hostLoading = false;
  lastSortEvent: unknown = null;
  lastPageEvent: unknown = null;
  lastRowActionEvent: unknown = null;

  onSort(event: unknown) { this.lastSortEvent = event; }
  onPage(event: unknown) { this.lastPageEvent = event; }
  onRowAction(event: unknown) { this.lastRowActionEvent = event; }
}

describe('DataTable', () => {
  function setupTable<T extends Record<string, unknown>>(
    overrides: {
      columns?: TableColumn<T>[];
      data?: T[];
      actions?: TableAction[];
      pageSize?: number;
      loading?: boolean;
    } = {},
  ): ComponentFixture<DataTable<T>> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DataTable],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(DataTable<T>);
    fixtureRef.componentRef.setInput('columns', overrides.columns ?? (columns as unknown as TableColumn<T>[]));
    fixtureRef.componentRef.setInput('data', overrides.data ?? (sampleData as unknown as T[]));
    fixtureRef.componentRef.setInput('actions', overrides.actions ?? (actions as unknown as TableAction[]));
    fixtureRef.componentRef.setInput('pageSize', overrides.pageSize ?? 10);
    fixtureRef.componentRef.setInput('loading', overrides.loading ?? false);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render headers from columns config', () => {
    const fixture = setupTable<TestRow>();

    const thElements = fixture.nativeElement.querySelectorAll('th');
    // 4 data columns + 1 actions column = 5
    expect(thElements.length).toBe(5);

    const headerTexts = Array.from(thElements).map((th) => (th as HTMLElement).textContent!.trim());
    expect(headerTexts).toContain('ID');
    expect(headerTexts).toContain('Nombre');
    expect(headerTexts).toContain('Correo');
    expect(headerTexts).toContain('Estado');
    expect(headerTexts).toContain('Actions');
  });

  it('should render data rows', () => {
    const fixture = setupTable<TestRow>();

    const trElements = fixture.nativeElement.querySelectorAll('tbody tr');
    // 3 data rows
    expect(trElements.length).toBe(3);

    const firstRowCells = trElements[0].querySelectorAll('td');
    const cellTexts = Array.from(firstRowCells).map((td) => (td as HTMLElement).textContent!.trim());
    expect(cellTexts).toContain('1');
    expect(cellTexts).toContain('Alice');
    expect(cellTexts).toContain('alice@example.com');
  });

  it('should emit sortChange on header click for sortable columns', () => {
    const fixture = setupTable<TestRow>();

    let sortEvent: SortEvent | null = null;
    fixture.componentInstance.sortChange.subscribe((e: SortEvent) => { sortEvent = e; });

    // Click on the "Nombre" header (sortable column, 2nd th)
    const thElements = fixture.nativeElement.querySelectorAll('th');
    const nameHeader = thElements[1] as HTMLElement;
    nameHeader.click();
    fixture.detectChanges();

    expect(sortEvent).toEqual({ column: 'name', direction: 'asc' });
  });

  it('should toggle sort direction on second click of same column', () => {
    const fixture = setupTable<TestRow>();

    const events: SortEvent[] = [];
    fixture.componentInstance.sortChange.subscribe((e: SortEvent) => { events.push(e); });

    const nameHeader = fixture.nativeElement.querySelectorAll('th')[1] as HTMLElement;
    nameHeader.click();
    nameHeader.click();
    fixture.detectChanges();

    expect(events.length).toBe(2);
    expect(events[0]).toEqual({ column: 'name', direction: 'asc' });
    expect(events[1]).toEqual({ column: 'name', direction: 'desc' });
  });

  it('should not emit sortChange for non-sortable columns', () => {
    const fixture = setupTable<TestRow>();

    let sortEvent: SortEvent | null = null;
    fixture.componentInstance.sortChange.subscribe((e: SortEvent) => { sortEvent = e; });

    // Click on the "ID" header (non-sortable)
    const idHeader = fixture.nativeElement.querySelectorAll('th')[0] as HTMLElement;
    idHeader.click();
    fixture.detectChanges();

    expect(sortEvent).toBeNull();
  });

  it('should emit pageChange on pagination', () => {
    const fixture = setupTable<TestRow>({ pageSize: 2 });

    let pageEvent: PageEvent | null = null;
    fixture.componentInstance.pageChange.subscribe((e: PageEvent) => { pageEvent = e; });

    // Click next page button
    const nextBtn = fixture.nativeElement.querySelector('[data-testid="pagination-next"]') as HTMLElement;
    expect(nextBtn).toBeTruthy();
    nextBtn.click();
    fixture.detectChanges();

    expect(pageEvent).toEqual({ page: 2, pageSize: 2 });
  });

  it('should emit rowAction on action button click', () => {
    const fixture = setupTable<TestRow>();

    let rowActionEvent: RowActionEvent | null = null;
    fixture.componentInstance.rowAction.subscribe((e: RowActionEvent) => { rowActionEvent = e; });

    // Click the first action button in the first row (edit)
    const actionBtns = fixture.nativeElement.querySelectorAll('[data-testid="action-btn"]');
    expect(actionBtns.length).toBeGreaterThan(0);
    (actionBtns[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(rowActionEvent).toEqual({ action: 'edit', row: sampleData[0] });
  });

  it('should show empty message when no data', () => {
    const fixture = setupTable<TestRow>({ data: [] });

    const emptyMsg = fixture.nativeElement.querySelector('[data-testid="data-table-empty"]');
    expect(emptyMsg).toBeTruthy();
    expect(emptyMsg.textContent!.trim()).toContain('No data available');

    // No table body rows
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(0);
  });

  it('should show loading state', () => {
    const fixture = setupTable<TestRow>({ loading: true });

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="data-table-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  it('should paginate correctly with 2 items per page', () => {
    const fixture = setupTable<TestRow>({ pageSize: 2 });

    // With 3 items and pageSize 2, page 1 should show 2 rows
    let rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    // Page info should show "Page 1 of 2"
    const pageInfo = fixture.nativeElement.querySelector('[data-testid="pagination-info"]');
    expect(pageInfo).toBeTruthy();
    expect(pageInfo.textContent!.trim()).toContain('1');
    expect(pageInfo.textContent!.trim()).toContain('2');
  });

  it('should use 10 as default pageSize', () => {
    const fixture = setupTable<TestRow>({ pageSize: undefined as unknown as number });

    const pageInfo = fixture.nativeElement.querySelector('[data-testid="pagination-info"]');
    expect(pageInfo).toBeTruthy();
    // With 3 items and default pageSize 10, there's only 1 page
    expect(pageInfo.textContent!.trim()).toContain('1');
  });

  it('should render action buttons in a dedicated column', () => {
    const fixture = setupTable<TestRow>();

    // Check that action buttons exist
    const actionBtns = fixture.nativeElement.querySelectorAll('[data-testid="action-btn"]');
    // 3 rows * 2 actions = 6 buttons
    expect(actionBtns.length).toBe(6);
  });
});
