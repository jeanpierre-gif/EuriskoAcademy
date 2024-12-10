class Paginator {
  constructor(model, filter, options = {}) {
    this.model = model;
    this.filter = filter;
    this.page = options.page || 1;
    this.limit = options.limit || 10;
    this.sort = options.sort || {};
    this.projection = options.projection || "";
  }

  async paginate() {
    const skip = (this.page - 1) * this.limit;

    try {
      const result = await this.model
        .find(this.filter)
        .select(this.projection)
        .sort(this.sort)
        .skip(skip)
        .limit(this.limit);

      const totalItems = await this.model.countDocuments(this.filter);

      return {
        pagination: {
          totalItems,
          currentPage: this.page,
          totalPages: Math.ceil(totalItems / this.limit),
          pageSize: this.limit,
        },
        data: result,
      };
    } catch (err) {
      throw new Error(err.message); 
    }
  }
}

module.exports = Paginator;
