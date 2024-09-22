import "../Styles/ProductsPage.css";
import axios from "axios";
import React, { Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../Components/Layout";
import { useAuth } from "../Contexts/auth";
import toast from "react-hot-toast";
import ProductSkeleton from "../Components/Skeletons/ProductSkeleton";
const Product = React.lazy(() => import("../Components/Product"));

function ProductsSubcatPage() {
  const { categoryName, subcategoryName } = useParams();
  const [subcategories, setSubcategories] = useState();
  const [products, setProducts] = useState([]);
  const [auth] = useAuth();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const getSubCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API}/category/get-subcategories/${categoryName}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (res?.data.success) {
        setSubcategories(res.data.subcategories);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting subcategories");
    }
  };

  const getProducts = async () => {
    try {
      setLoading(true);
      // console.log("Page" + page);
      const res = await axios.post(
        `${process.env.REACT_APP_API}/product/get-productsByType/${categoryName}/${subcategoryName}`,
        {
          page: page,
        },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (res?.data.success) {
        const newProducts = res.data.products;
        if (page === 1) {
          setProducts(newProducts);
        } else {
          setProducts((prevData) => [...prevData, ...newProducts]);
        }
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting products");
    }
  };
  const handleInfiniteScroll = () => {
    try {
      if (
        !loading &&
        window.innerHeight + document.documentElement.scrollTop + 600 >
          document.documentElement.scrollHeight
      ) {
        setLoading(true);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  useEffect(() => {
    const debouncedScrollHandler = debounce(handleInfiniteScroll, 200); // Adjust the debounce time as needed
    window.addEventListener("scroll", debouncedScrollHandler);
    return () => window.removeEventListener("scroll", debouncedScrollHandler);
  }, []);

  useEffect(() => {
    getSubCategories();
    setProducts([]);
    setPage(1);
  }, [categoryName]);

  useEffect(() => {
    getProducts();
  }, [page, categoryName, subcategoryName]);

  return (
    <div className="productsPage">
      <Layout>
        <div className="productsPageContainer">
          <div className="productsNavbar">
            <div className="productsNavbarHeading">Categories</div>
            <ul className="productsNavbarList">
              {subcategories?.map((subcat, index) => {
                return (
                  <Link
                    key={index}
                    to={`/category/${categoryName}/${subcat.name}`}
                    className="productsNavbarItem"
                  >
                    <li>{subcat.name}</li>
                  </Link>
                );
              })}
            </ul>
          </div>
          <div className="productsOuterContainer">
            <div className="productsContainer">
              {products?.map((product, index) => {
                return (
                  <Suspense key={index} fallback={<ProductSkeleton />}>
                    <Link
                      key={index}
                      className="link"
                      to={`/product/${product._id}`}
                    >
                      <Product
                        key={index}
                        name={product.name}
                        price={product.price}
                        image={product.image.url}
                        className="productsPageProduct"
                      />{" "}
                    </Link>
                  </Suspense>
                );
              })}
            </div>
            <div className="loader">{loading && <p>Loading</p>}</div>
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default ProductsSubcatPage;
