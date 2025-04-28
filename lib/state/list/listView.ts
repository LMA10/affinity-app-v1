import { proxy } from "valtio"

interface Column {
  key: string
  label: string
}

interface ListViewState {
  data: any[]
  visibleColumns: Column[]
  setListData: (data: any[]) => void
  setVisibleColumns: (columns: Column[]) => void
}

const listView = proxy<ListViewState>({
  data: [],
  visibleColumns: [],

  setListData(data: any[]) {
    this.data = data
  },

  setVisibleColumns(columns: Column[]) {
    this.visibleColumns = columns
  },
})

export default listView
