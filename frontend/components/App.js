import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'
import axiosWithAuth from '../axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { /* ✨ implement */ }
  const redirectToArticles = () => { /* ✨ implement */ }


  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    setMessage('Goodbye!')
    window.localStorage.removeItem('token')
    navigate('/')
  }
  
  const login = ({ username, password }) => {

    setMessage('')
    setSpinnerOn(true)
    axios.post(loginUrl, { username, password })
      .then(res => {
        setMessage(res.data.message)
        const token = res.data.token
        window.localStorage.setItem('token', token)
        navigate('/articles')
      })
      .catch(err => {
        console.log(err)
      })
      .finally( _ => {
        setSpinnerOn(false)
      })

  }

  const getArticles = () => {
    // ✨ implement
    setMessage('')
    setSpinnerOn(true)

    axiosWithAuth().get(articlesUrl)
      .then(res => {
        setArticles(res.data.articles)
        setMessage(res.data.message)
      })
      .catch(err => {
        if (err.response.status === 401) {
          navigate('/')
        }
      })
      .finally( _ => {
        setSpinnerOn(false)
      })

  }

  const onSubmit = article => {
    if (currentArticleId) {
      putArticle(article)
    } else {
      postArticle(article)
    }
  }

  const putArticle = article => {
    setSpinnerOn(true)
    const { article_id, ...changes } = article
    axiosWithAuth().put(`${articlesUrl}/${article_id}`, changes) 
    .then(res => {
      setArticles(articles.map(art => {
        return art.article_id === article_id
        ? res.data.article
        : art
      }))
      setMessage(res.data.message)
      setCurrentArticleId(null)
    })
    .catch(err => {
      console.log(err?.response?.data?.message)
    })  
    .finally( _ => {
      setSpinnerOn(false)
    }) 
  }

  const postArticle = article => {
    setSpinnerOn(true)
    axiosWithAuth().post(articlesUrl, article)
      .then(res => {
        setArticles([ ...articles, res.data.article])
        setMessage(res.data.message)
      })
      .catch(err => {
        setMessage(err.response.data.message)
      })
      .finally( _ => {
        setSpinnerOn(false)
      })
  }
  //({ article_id, article })
  const updateArticle = article_id => {

    setCurrentArticleId(article_id)
  }

  const deleteArticle = article_id => {
   
    setSpinnerOn(true)
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
      .then(res => {
        setMessage(res.data.message)
        setArticles(articles.filter(art => {
          return art.article_id !== article_id
        }))
      })
      .catch(err => {
        setMessage(err?.response?.data?.message)
      })
      .finally( _ => {
        setSpinnerOn(false)
      })
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <React.StrictMode>
      <Spinner on={spinnerOn}/>
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm
                onSubmit={onSubmit}
                article={articles.find(art => art.article_id === currentArticleId)}
              />
              <Articles 
                getArticles={getArticles}
                articles={articles}
                message={message}
                updateArticle={updateArticle}
                deleteArticle={deleteArticle}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </React.StrictMode>
  )
}