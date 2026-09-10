import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { deleteReview } from "../controllers/reviewController.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

function mockResponse() {
  const res = {};
  res.statusCode = null;
  res.jsonData = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
}

describe("deleteReview Authorization", () => {
  it("(a) guest review, unauthenticated delete attempt -> 403", async () => {
    const guestReview = {
      _id: "review123",
      user: null,
      name: "Guest User",
      comment: "Nice place",
    };

    mock.method(Review, "findById", async () => guestReview);
    const deleteSpy = mock.method(Review, "findByIdAndDelete", async () => {});

    const req = {
      params: { id: "review123" },
      userId: undefined,
    };
    const res = mockResponse();

    await deleteReview(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.success, false);
    assert.equal(deleteSpy.mock.callCount(), 0);

    mock.reset();
  });

  it("(b) user-owned review, delete attempt with no token -> 403", async () => {
    const userReview = {
      _id: "review456",
      user: "user_owner_id_123",
      name: "Owner User",
      comment: "Great experience",
    };

    mock.method(Review, "findById", async () => userReview);
    const deleteSpy = mock.method(Review, "findByIdAndDelete", async () => {});

    const req = {
      params: { id: "review456" },
      userId: undefined,
    };
    const res = mockResponse();

    await deleteReview(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.success, false);
    assert.equal(deleteSpy.mock.callCount(), 0);

    mock.reset();
  });

  it("(c) user-owned review, delete attempt by a different logged-in user -> 403", async () => {
    const userReview = {
      _id: "review789",
      user: "user_owner_id_123",
      name: "Owner User",
      comment: "Loved it",
    };

    const differentUser = {
      _id: "different_user_456",
      role: "user",
    };

    mock.method(Review, "findById", async () => userReview);
    mock.method(User, "findById", async () => differentUser);
    const deleteSpy = mock.method(Review, "findByIdAndDelete", async () => {});

    const req = {
      params: { id: "review789" },
      userId: "different_user_456",
    };
    const res = mockResponse();

    await deleteReview(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.success, false);
    assert.equal(deleteSpy.mock.callCount(), 0);

    mock.reset();
  });

  it("(d) user-owned review, delete attempt by owner -> 200", async () => {
    const userReview = {
      _id: "review101",
      user: "user_owner_id_123",
      name: "Owner User",
      comment: "Loved it",
    };

    const ownerUser = {
      _id: "user_owner_id_123",
      role: "user",
    };

    mock.method(Review, "findById", async () => userReview);
    mock.method(User, "findById", async () => ownerUser);
    const deleteSpy = mock.method(Review, "findByIdAndDelete", async () => ({ _id: "review101" }));

    const req = {
      params: { id: "review101" },
      userId: "user_owner_id_123",
    };
    const res = mockResponse();

    await deleteReview(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.equal(deleteSpy.mock.callCount(), 1);

    mock.reset();
  });

  it("(e) guest review, delete attempt by admin -> 200", async () => {
    const guestReview = {
      _id: "review202",
      user: null,
      name: "Guest User",
      comment: "Loved it",
    };

    const adminUser = {
      _id: "admin_user_999",
      role: "admin",
    };

    mock.method(Review, "findById", async () => guestReview);
    mock.method(User, "findById", async () => adminUser);
    const deleteSpy = mock.method(Review, "findByIdAndDelete", async () => ({ _id: "review202" }));

    const req = {
      params: { id: "review202" },
      userId: "admin_user_999",
    };
    const res = mockResponse();

    await deleteReview(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.equal(deleteSpy.mock.callCount(), 1);

    mock.reset();
  });
});
