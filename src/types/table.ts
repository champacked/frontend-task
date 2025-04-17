export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
}
