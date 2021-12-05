/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Product from '../models/product.js';

// @desc   Create a product
// @route  POST /api/products/
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// @desc   Fetch all products
// @route  GET /api/products/
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  // 관리자 페이지에 필요한 데이터까지 추가
  const products = await Product.find({})
    .populate('artist', ['name', 'aka', 'code', 'record'])
    .exec();

  res.json(products);
});

// @desc   Fetch filtered products
// @route  GET /api/products/filter
// @access Public
const getProductsByFilter = asyncHandler(async (req, res) => {
  // 품절 제외
  let products;
  const { theme, sizeMin, sizeMax, priceMin, priceMax } = req.query;

  if (theme) {
    products = await Product.find(
      { theme, inStock: true },
      {
        artCode: 0,
        'info.details': 0,
        'info.createdAt': 0,
      },
    ).populate('artist', ['name']);
  }
  if (sizeMin && sizeMax) {
    products = await Product.find(
      {
        'info.canvas': {
          $gte: sizeMin,
          $lte: sizeMax,
        },
        inStock: true,
      },
      {
        artCode: 0,
        theme: 0,
        'info.details': 0,
        'info.createdAt': 0,
      },
    ).populate('artist', ['name']);
  }
  if (priceMin && priceMax) {
    products = await Product.find(
      {
        price: {
          $gte: priceMin,
          $lte: priceMax,
        },
        inStock: true,
      },
      {
        artCode: 0,
        theme: 0,
        'info.details': 0,
        'info.createdAt': 0,
      },
    ).populate('artist', ['name']);
  }
  res.json(products);
});

// @desc    Update a product
// @route   PATCH /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  // 재고 있을 시 상품 삭제 가능
  const { productId } = req.query;
  const product = await Product.findByIdAndDelete(productId, {
    inStock: true,
  });

  if (product) {
    res.json({ message: `해당 상품이 삭제되었습니다` });
  } else {
    res.status(400).json({ message: '해당 상품은 삭제할 수 없습니다' });
  }
});

// @desc   Fetch single product
// @route  GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const productDetail = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { count: 1 } }, // 조회수 올리기!!
    {
      projection: {
        count: 0,
        updatedAt: 0,
      },
      new: true,
    },
  ).populate('artist', ['name', 'code', 'aka', 'record']);
  // console.log(productDetail);

  const productsByArtist = await Product.aggregate([
    { $match: { artist: productDetail.artist._id } },
    { $sample: { size: 4 } },
    { $project: { image: 1 } },
  ]);

  const productsByRandom = await Product.aggregate([
    { $match: { artist: { $ne: productDetail.artist._id } } },
    { $sample: { size: 8 } },
    { $project: { image: 1 } },
  ]);

  res.json({ productDetail, productsByArtist, productsByRandom });
});

// @desc   Fetch latest products
// @route  GET /api/products/latest
// @access Public
const getLatestProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}, { image: 1 })
    .limit(6)
    .sort({ updatedAt: -1 });

  if (products) res.json(products);
  else {
    res.status(404).json({ message: '상품이 존재하지 않습니다' });
  }
});

// @desc   Check stock of cartItems
// @route  GET /api/products/cartItems
// @access Public
const getCartItems = asyncHandler(async (req, res) => {
  // 장바구니 상품 재고 확인 차 요청
  const { productId } = req.query;

  const products = await Product.find(
    { _id: { $in: productId } },
    {
      title: 1,
      image: 1,
      'info.size': 1,
      'info.canvas': 1,
      price: 1,
      inStock: 1,
    },
  ).populate('artist', ['name']);

  res.json(products);
});

// @desc   Fetch cartItems totalprice
// @route  GET /api/products/totalPrice
// @access Private
const getTotalPrice = asyncHandler(async (req, res) => {
  // 결제로 넘어갈 시 총 상품 금액
  let { productId } = req.query;
  const { ObjectId } = mongoose.Types;

  if (!Array.isArray(productId)) {
    productId = [new ObjectId(productId)];
  } else productId = productId.map((id) => new ObjectId(id));

  const totalPrice = await Product.aggregate([
    {
      $match: { _id: { $in: productId } },
    },
    {
      $group: {
        _id: '장바구니 상품 총 금액',
        totalPrice: { $sum: '$price' },
      },
    },
  ]);
  res.json(totalPrice[0]);
});

// @desc   Zzim or unZzim the product
// @route  PATCH /api/products/zzim
// @access Private
const zzimProduct = asyncHandler(async (req, res) => {
  // 찜 해체 시에는 id가 배열로 올 수 있다. (선택삭제)
  const { productId, zzim } = req.body;
  if (zzim === undefined) res.status(404).json({ message: 'true? of false?' });
  else {
    if (zzim === true) {
      await Product.findByIdAndUpdate(
        productId,
        {
          $addToSet: { likes: req.user._id },
        },
        { new: true, upsert: true },
      ); // likes 배열에 유저 고유 아이디 넣기

      res.json({ message: '해당 상품 찜 완료' });
      return;
    }
    if (zzim === false) {
      await Product.updateMany(
        { _id: { $in: productId } },
        {
          $pull: { likes: req.user._id },
        },
        { multi: true },
      );
      res.json({ message: '해당 상품 찜 해제' });
    }
  }
});

// @desc   Fetch products in zzimlist
// @route  GET /api/products/zzim
// @access Private
const getZzimProducts = asyncHandler(async (req, res) => {
  const products = await Product.find(
    { likes: req.user._id },
    {
      title: 1,
      image: 1,
      'info.size': 1,
      'info.canvas': 1,
      price: 1,
    },
  )
    .populate('artist', ['name'])
    .exec();

  res.json(products);
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductsByFilter,
  getProductById,
  getLatestProducts,
  zzimProduct,
  getZzimProducts,
  getCartItems,
  getTotalPrice,
};
