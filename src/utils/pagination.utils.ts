/**
 * @param params - { page?: number; limit?: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }
 * 
 * @description - Utility function to build pagination parameters with default values.
 * The page and limit parameters default to 1 and 10 respectively if not provided.
 * The orderBy parameter defaults to "desc" and the orderType parameter defaults to "createdAt"
 */
async function buildPagination(params: { page?: number; limit?: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const orderBy = params.orderBy || "desc";
  const orderType = params.orderType || "createdAt";
  return { page, limit, orderBy, orderType };
}

export { buildPagination };
