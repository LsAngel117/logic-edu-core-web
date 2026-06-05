import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
import {
  LucideArrowUp,
  LucideArrowDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucidePencil,
  LucideTrash2,
  LucideEye,
  LucideInbox,
} from '@lucide/angular';
import { TableColumn, TableAction, SortEvent, PageEvent, RowActionEvent } from '../models';

const ICON_MAP: Record<string, unknown> = {
  pencil: LucidePencil,
  trash2: LucideTrash2,
  eye: LucideEye,
};

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    LucideArrowUp,
    LucideArrowDown,
    LucideChevronLeft,
    LucideChevronRight,
    LucidePencil,
    LucideTrash2,
    LucideEye,
    LucideInbox,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T extends Record<string, unknown>> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly actions = input<TableAction[]>([]);
  readonly pageSize = input(10);
  readonly loading = input(false);

  readonly sortChange = output<SortEvent>();
  readonly pageChange = output<PageEvent>();
  readonly rowAction = output<RowActionEvent>();

  readonly currentPage = signal(1);
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  readonly paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.data().slice(start, start + this.pageSize());
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.data().length / this.pageSize())),
  );

  onSort(column: string): void {
    const col = this.columns().find((c) => c.key === column);
    if (!col?.sortable) return;

    if (this.sortColumn() === column) {
      const newDir = this.sortDirection() === 'asc' ? 'desc' : 'asc';
      this.sortDirection.set(newDir);
      this.sortChange.emit({ column, direction: newDir });
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
      this.sortChange.emit({ column, direction: 'asc' });
    }
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.pageChange.emit({ page, pageSize: this.pageSize() });
  }

  onRowActionClick(action: string, row: T): void {
    this.rowAction.emit({ action, row });
  }

  /** Resolve a Lucide icon class by icon name */
  getIcon(name: string): unknown {
    return ICON_MAP[name] ?? LucideEye;
  }
}
