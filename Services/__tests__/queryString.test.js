import { serializeParams } from "../queryString"

describe("serializeParams", () => {
  it("writes an object as key[field], leaving out its empty fields, as v2 reads filter[...] and sort[...]", () => {
    const params = { finished: 0, mine: 1, filter: { sort_date: "newest", sort_type: null, category_id: 0, filter_job: "" } }
    expect(serializeParams(params)).toBe("finished=0&mine=1&filter[sort_date]=newest&filter[category_id]=0&filter[filter_job]=")
  })

  it("leaves out null and undefined, writes arrays as key[]", () => {
    expect(serializeParams({ cursor: null, task_id: undefined, ids: [1, 2], q: "a b" })).toBe("ids[]=1&ids[]=2&q=a+b")
  })

  it("is empty without params", () => {
    expect(serializeParams(undefined)).toBe("")
  })
})
