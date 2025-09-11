//базовый класс view модели для запросов за списком с пагинацией
export abstract class PaginatedViewDto<T> {
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;
  abstract items: T;

  //статический метод-утилита для мапинга
  public static mapToView<T>(data: {
    page: number;
    size: number;
    totalCount: number;
    items: T;
  }): PaginatedViewDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}
