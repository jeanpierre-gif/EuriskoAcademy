const paginate = async (model, filter, options) => {
  const { page = 1, limit = 10, sort = {}, projection = "" } = options;
  const skip = (page - 1) * limit;
  const result = await model
    .find(filter)
    .select(projection)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  const totalItems = await model.countDocuments(filter);

  return {
    pagination: {
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      pageSize: limit,
    },
    data: result,
  };
};

module.exports = paginate;