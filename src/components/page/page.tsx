import { connect } from 'react-redux';
import AppState from '../../stateI';
import * as React from 'react';
import { Dispatch } from 'redux';
import { getPage } from '../../actions/page';
import { changeColor } from '../../actions/theme';
import { addBackGroundImg } from '../../actions/background';
import { setNavTitle, fullModel } from '../../actions/nav';
import { toc } from '../context/context';
import * as _ from 'underscore'
import { array_rand, array_randS } from '../../lib/random';
import { pageState } from '../../reducers/page';
import Grid from '../grid/grid';
import PostCard from '../postCard/postCard';
import post from '../../reducers/post';
import { FormattedDate } from 'react-intl';
import { Card } from 'material-ui/Card';
import Comment from '../comment/comment';
import FixedAt from '../fixedAt/fixedAt';
import TocList from '../tocList/tocList';
import page from '../../reducers/page';
const url = require('url');
const style = require('./page.less')

interface PageProps {
  loadingPage?: (title: string) => void;
  onChangeColor?: (primaryColor: string, accentColor: string) => void;
  addBackGroundImg?: (backgroundImg: string, key: string) => void
  fullModel?: (fullModelB: boolean) => void
  setNavTitle?: (title: string) => void
  defaultPrimaryColor?: string
  defaultAccentColor?: string
  phone?: boolean
  siteUrl?: string
  pagesList?: Map<string, pageState>;
  params?: {
    title?: string
  }
}

interface PageState {
  tocArray: toc[]
}

let Cstate: AppState;

class Page extends React.Component<PageProps, PageState>{
  loaded = false
  default_thumbnail: string
  constructor() {
    super();
    this.state = {
      tocArray: []
    };
  }

  toc(tocArray: toc[]) {
    if (!_.isEqual(tocArray, this.state.tocArray)) {
      this.setState({
        ...this.state,
        tocArray: tocArray
      })
    }
  }

  componentWillMount() {
    this.default_thumbnail = array_rand(Cstate.theme.img.post_thumbnail)
    this.props.onChangeColor(this.props.defaultPrimaryColor, this.props.defaultAccentColor);
    this.props.fullModel(true)
  }

  onloaded(page: pageState) {
    let {background = true} = page;
    if (page.primarycolor || page.accentcolor)
      this.props.onChangeColor(array_randS(page.primarycolor), array_randS(page.accentcolor));
    this.props.addBackGroundImg(url.resolve(this.props.siteUrl, array_randS(page.thumbnail) || this.default_thumbnail), "page-" + page.title)
    if (page.title)
      this.props.setNavTitle(page.title)
    if (background)
      this.props.fullModel(false)
  }

  render() {
    let {pagesList = new Map<string, pageState>(), params = {}, phone = false, siteUrl = ""} = this.props
    let {title} = params;
    let page = pagesList.get(title);
    let background
    let thumbnail;
    if (typeof page === "undefined" || typeof page.content === "undefined") {
      page = page || {};
      if (!page.loading) {
        this.props.loadingPage(title);
      }
    } else {
      thumbnail = page.background
      if (page.thumbnail) thumbnail = url.resolve(siteUrl, array_randS(page.thumbnail))  || this.default_thumbnail;
      if (this.loaded == false) {
        this.loaded = true
        this.onloaded(page)
      }
    }
    return (
    <div className={"Page " + (background?"":"pagefullModel")}>
      <Grid>
        <div className={style.page}>
          <PostCard
            post={{
              content:page.content,
              thumbnail:page.thumbnail,
              title:page.title,
              date:page.date
            }}
            className={style.PageCard}
            cardMedia={!phone}
            cardMediaStyle={{
              height: "275px"
            }}
            toc={this.toc.bind(this)}
            />
          {
            page.comments ?
              <Card className={style.commentCard}>
                {
                  (title != '' && page.title) ? <Comment postID={title} className={style.Comment} postTitle={page.title.toString()}></Comment> : undefined
                }
              </Card> : undefined
          }
        </div>
        {
          (!page.toc || phone || this.state.tocArray.length == 0) ? undefined :
            <div className={style.toc} ref="toc">
              <FixedAt fixedHeight={300} className={style.tocFixed}><TocList tocArray={this.state.tocArray} className={style.TocList}></TocList></FixedAt>
            </div>
        }
      </Grid>
    </div>)
  }
}

const mapStateToProps = (state: AppState) => {
  let { theme = {}, pagesList = new Map<string, pageState>() } = state;
  let { uiux = {} } = theme;
  let { defaultPrimaryColor = 'cyan', defaultAccentColor = 'pink'} = uiux
  Cstate = state
  return {
    pagesList: pagesList,
    defaultPrimaryColor: array_randS(defaultPrimaryColor),
    defaultAccentColor: array_randS(defaultAccentColor),
    phone: state.windowSize.smaller.than.phone,
    siteUrl: state.site.siteUrl || ""
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    loadingPage: (title: string) => {
      dispatch(getPage(title) as any)
    },
    onChangeColor: (primaryColor: string, accentColor: string) => {
      dispatch(changeColor(primaryColor, accentColor))
    },
    addBackGroundImg: (backgroundImg: string, key: string) => {
      dispatch(addBackGroundImg(backgroundImg, key))
    },
    setNavTitle: (title: string) => {
      dispatch(setNavTitle(title));
    },
    fullModel: (fullModelB: boolean) => {
      dispatch(fullModel(fullModelB));
    }
  }
}

const PageX = connect<AppState, PageProps, PageState>(mapStateToProps, mapDispatchToProps)(Page as any)

export default PageX;