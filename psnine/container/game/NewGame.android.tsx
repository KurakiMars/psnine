import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  InteractionManager,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
  Linking,
  PixelRatio
} from 'react-native'

import Ionicons from 'react-native-vector-icons/Ionicons'
import {
  standardColor,
  idColor
} from '../../constant/colorConfig'

import { getGameNewTopicAPI } from '../../dao'

import CreateNewGameTab from './NewGameTab'

declare var global

let screen = Dimensions.get('window')
const { height: SCREEN_HEIGHT } = screen

let toolbarActions = [
  {
    title: '官网', show: 'never'
  }
]

let toolbarHeight = 56
import {
  ExtraDimensionsAndroid,
  AppBarLayoutAndroid,
  CoordinatorLayoutAndroid,
  CollapsingToolbarLayoutAndroid
} from 'mao-rn-android-kit'

const limit = 160 // - toolbarHeight

import ImageBackground from '../../component/ImageBackground'

export default class Home extends Component<any, any> {

  constructor(props) {
    super(props)
    this.state = {
      data: false,
      isLoading: true,
      toolbar: [],
      afterEachHooks: [],
      mainContent: false,
      rotation: new Animated.Value(1),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      openVal: new Animated.Value(0),
      modalVisible: false,
      modalOpenVal: new Animated.Value(0),
      marginTop: new Animated.Value(0),
      onActionSelected: this._onActionSelected,
      leftIcon: false,
      rightIcon: false,
      _scrollHeight: this.props.screenProps.modeInfo.height - (StatusBar.currentHeight || 0 ) - 56
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.screenProps.modeInfo.width !== nextProps.screenProps.modeInfo.width) {
      this.preFetch()
      // this.props.navigation.navigate('Home', params)
    }
  }

  onActionSelected = (index) => {
    const { data: source } = this.state
    if (source && source.titleInfo && source.titleInfo.content && source.titleInfo.content.length) {
      const item = source.titleInfo.content.filter(item => item.includes('href')).pop()
      if (item) {
        let match = item.match(/\'(.*?)\'/)
        if (!match) match = item.match(/\"(.*?)\"/)
        if (match && match[1]) Linking.openURL(match[1]).catch(err => global.toast(err.toString()))
      } else {
        global.toast('官方网站尚未收录')
      }
    } else {
      global.toast('官方网站尚未收录')
    }
  }

  componentWillUnmount() {
    this.removeListener && this.removeListener.remove()
    if (this.timeout) clearTimeout(this.timeout)
  }

  componentWillMount() {
    this.preFetch()
  }

  preFetch = () => {
    const { params } = this.props.navigation.state
    this.setState({
      isLoading: true
    })
    InteractionManager.runAfterInteractions(() => {
      const data = getGameNewTopicAPI(params.URL).then(data => {
        this.setState({
          data,
          isLoading: false
        }, () => this._coordinatorLayout.setScrollingViewBehavior(this._scrollView))
      })
    })
  }

  handleImageOnclick = (url) => this.props.navigation.navigate('ImageViewer', {
    images: [
      { url }
    ]
  })

  renderHeader = (rowData) => {
    const { modeInfo } = this.props.screenProps
    const { psnButtonInfo } = this.state.data
    const { marginTop } = this.state
    const { nightModeInfo } = modeInfo
    const color = 'rgba(255,255,255,1)'
    const infoColor = 'rgba(255,255,255,0.8)'
    const { width: SCREEN_WIDTH } = Dimensions.get('window')
    return (
      <ImageBackground
        source={{uri: rowData.backgroundImage}}
        style={{
          height: limit + toolbarHeight + 1,
          width: SCREEN_WIDTH
        }}
        >
      <View style={{
        backgroundColor: 'transparent',
        height: limit,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginTop: 56 + 10
      }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: -1, marginLeft: 20, marginBottom: 15  }}>
          <Image
            source={{ uri: rowData.avatar}}
            style={[styles.avatar, { width: 120, height: 120, overlayColor: 'rgba(0,0,0,0.0)', backgroundColor: 'transparent' }]}
          />
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'flex-start',
            marginBottom: 15,
            maxWidth: SCREEN_WIDTH - 120,
            overflow: 'scroll',
            flexWrap: 'nowrap', padding: 10, paddingTop: 0, paddingLeft: 30 }}>
          {rowData.content.map((item, index) => {
            return item.includes('href') ? (
              undefined
              /*<global.HTMLView
                value={item}
                key={index}
                modeInfo={modeInfo}
                stylesheet={styles}
                imagePaddingOffset={120 + 10}
                shouldForceInline={true}
              />*/
            ) : <Text key={index} style={{ fontSize: index === 0 ? 18 : 12, textShadowRadius: 3,
              textShadowColor: 'rgba(255,255,255,1)', textShadowOffset: { width: 1, height: 2 } }}>{item}</Text>
          })}

        </View>

      </View>
      </ImageBackground>
    )
  }

  renderTabContainer = (list) => {
    const { modeInfo } = this.props.screenProps
    const { params } = this.props.navigation.state
    const { marginTop } = this.state
    return (
      <CreateNewGameTab screenProps={{
        modeInfo: modeInfo,
        preFetch: this.preFetch,
        psnid: params.title,
        baseUrl: params.URL.replace(/\?.*?$/, ''),
        list: this.state.data.list,
        gameTable: this.state.data.gameTable,
        navigation: this.props.navigation
      }}/>
    )
  }

  render() {
    const { params } = this.props.navigation.state
    // console.log('GamePage.js rendered');
    const { modeInfo } = this.props.screenProps
    const { data: source, marginTop } = this.state
    const data: any[] = []
    const renderFuncArr: any[] = []
    const shouldPushData = !this.state.isLoading

    this.viewBottomIndex = Math.max(data.length - 1, 0)
    let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
    let ACTUAL_SCREEN_HEIGHT = SCREEN_HEIGHT - StatusBar.currentHeight + 1
    const actions = toolbarActions.slice()
    if (source && source.titleInfo && source.titleInfo.content && source.titleInfo.content.length) {
      const has = source.titleInfo.content.some(item => item.includes('href'))
      if (!has) {
        actions.pop()
      }
    }
    return source.titleInfo && this.state.leftIcon ? (
      <View style={{flex: 1}}>
        <CoordinatorLayoutAndroid
          fitsSystemWindows={false}
          ref={this._setCoordinatorLayout}>

          <AppBarLayoutAndroid
            ref={this._setAppBarLayout}
            style={styles.appbar} >
            <CollapsingToolbarLayoutAndroid
              expandedTitleMarginTop={100}
              expandedTitleMarginStart={20}
              expandedTitleMarginBottom={100}
              collapsedTitleColor={modeInfo.backgroundColor}
              contentScrimColor={modeInfo.standardColor}
              expandedTitleColor={modeInfo.titleTextColor}
              statusBarScrimColor={modeInfo.standardColor}
              titleEnable={false}
              layoutParams={{
                scrollFlags: (
                  AppBarLayoutAndroid.SCROLL_FLAG_SCROLL |
                  AppBarLayoutAndroid.SCROLL_FLAG_SNAP |
                  AppBarLayoutAndroid.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED
                )
              }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: modeInfo.standardColor
                }}
                layoutParams={{
                  collapseParallaxMultiplie: 0.7,
                  collapseMode: CollapsingToolbarLayoutAndroid.CollapseMode.COLLAPSE_MODE_PARALLAX
                }}>
                {source.titleInfo && this.renderHeader(source.titleInfo)}
              </View>
              <Ionicons.ToolbarAndroid
                navIconName='md-arrow-back'
                overflowIconName='md-more'
                iconColor={modeInfo.isNightMode ? '#000' : '#fff'}
                title={source.titleInfo.title}
                onIconClicked={() => this.props.navigation.goBack()}
                titleColor={modeInfo.isNightMode ? '#000' : '#fff'}
                actions={actions}
                origin
                onActionSelected={this.onActionSelected}
                layoutParams={{
                  height: 56 + StatusBar.currentHeight, // required
                  collapseMode: CollapsingToolbarLayoutAndroid.CollapseMode.COLLAPSE_MODE_PIN // required
                }}
                paddingTop={PixelRatio.getPixelSizeForLayoutSize(8)}
                minHeight={PixelRatio.getPixelSizeForLayoutSize(74)}
              />
            </CollapsingToolbarLayoutAndroid>
          </AppBarLayoutAndroid>

          <View
            style={[styles.scrollView, { height: this.state._scrollHeight, backgroundColor: modeInfo.brighterLevelOne }]}
            ref={this._setScrollView}>
            {this.renderTabContainer()}
          </View>
        </CoordinatorLayoutAndroid>
      </View>
    ) : <View style={{ flex: 1, backgroundColor: modeInfo.backgroundColor }}>
      <Ionicons.ToolbarAndroid
        navIconName='md-arrow-back'
        overflowIconName='md-more'
        iconColor={modeInfo.isNightMode ? '#000' : '#fff'}
        title={`${source.titleInfo ? source.titleInfo.title : '加载中...' }`}
        titleColor={modeInfo.isNightMode ? '#000' : '#fff'}
        style={[styles.toolbar, { backgroundColor: this.state.isLoading ? modeInfo.standardColor : 'transparent' }]}
        actions={actions}
        key={this.state.toolbar.map(item => item.text || '').join('::')}
        onIconClicked={() => this.props.navigation.goBack()}
        onActionSelected={this.onActionSelected}
      />
      <ActivityIndicator
        animating={this.state.isLoading}
        style={{
          flex: 999,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        color={modeInfo.accentColor}
        size={50}
      />
    </View>
  }

  _scrollHeight = (
    ExtraDimensionsAndroid.getStatusBarHeight() +
    ExtraDimensionsAndroid.getAppClientHeight() -
    ExtraDimensionsAndroid.getStatusBarHeight() -
    56
  )

  _coordinatorLayout = null
  _appBarLayout = null
  _scrollView = null

  _setCoordinatorLayout = component => {
    this._coordinatorLayout = component
  }

  _setAppBarLayout = component => {
    this._appBarLayout = component
  }

  _setScrollView = component => {
    this._scrollView = component
  }

  componentDidMount() {
    Promise.all([
      Ionicons.getImageSource('md-arrow-back', 24, '#fff'),
      Ionicons.getImageSource('md-more', 24, '#fff')
    ]).then(result => {
      this.setState({
        leftIcon: result[0],
        rightIcon: result[1]
      })
    })
  }

  _getItems(count) {
    let items: any = []

    for (let i = 0; i < count; i++) {
      items.push(
        <View
          key={i}
          style={[
            styles.item,
            { backgroundColor: ITEM_COLORS[i % ITEM_COLORS.length] }
          ]}>
          <Text style={styles.itemContent}>ITEM #{i}</Text>
        </View>
      )
    }

    return items
  }

}
const ITEM_COLORS = ['#E91E63', '#673AB7', '#2196F3', '#00BCD4', '#4CAF50', '#CDDC39']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF'
  },
  toolbar: {
    backgroundColor: standardColor,
    height: 56,
    elevation: 4
  },
  selectedTitle: {
    // backgroundColor: '#00ffff'
    // fontSize: 20
  },
  avatar: {
    width: 50,
    height: 50
  },
  a: {
    fontWeight: '300',
    color: idColor, // make links coloured pink,
    fontSize: 12
  },
  appbar: {
    backgroundColor: '#2278F6',
    height: 160 + 56
  },

  navbar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative'
  },

  backBtn: {
    top: 0,
    left: 0,
    height: 56,
    position: 'absolute'
  },

  caption: {
    color: '#fff',
    fontSize: 20
  },

  heading: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4889F1'
  },

  headingText: {
    color: 'rgba(255, 255, 255, .6)'
  },

  scrollView: {
    backgroundColor: '#f2f2f2'
  },

  item: {
    borderRadius: 2,
    height: 200,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },

  itemContent: {
    fontSize: 30,
    color: '#FFF'
  }
})
