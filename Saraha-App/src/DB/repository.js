export const findAll = ({
  model,
  filter = {},
  select = {},
  limit = "",
  skip = 0,
  sort = {},
  populate = "",
  lean = false,
}) => {
  const result = model.find(filter);

  if (select) result.select(select);
  if (sort) result.sort(sort);
  if (limit) result.limit(limit);
  if (skip) result.skip(skip);
  if (populate) result.populate(populate);
  if (lean) result.lean();

  return result;
};

export const findOne = ({
  model,
  filter = {},
  select = {},
  populate = "",
  lean = false,
}) => {
  const result = model.findOne(filter);

  if (select) result.select(select);
  if (populate) result.populate(populate);
  if (lean) result.lean();

  return result;
};

export const create = ({ model, data }) => {
  return model.create(data);
};

export const updateOne = ({ model, filter, data }) => {
  return model.updateOne(filter, data);
};

export const findOneAndUpdate = ({ model, filter, data }) => {
  return model.findOneAndUpdate(filter, data, { returnDocument: "after" });
};
