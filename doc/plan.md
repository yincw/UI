
sprite（spritesmith）
less
    autoprefix
    clean-css
concat

coffee
cmdize
transport
uglify

copy
clean
connect
watch
compress

---

项目

* 全局【global】√
* CSS部署
    【sprite】√
    【less】√
        autoprefix
        clean-css
   【concat】√ ×
* JS部署
    【coffee】√ ×
    【uglify】√ ×
* 调试【debug】
    connect
    watch
* 拷贝到...（copy）
    【copy】√ ×
* 导出（export）
    【compress】
* clear
    clean

组件

* 全局【global】√
* CSS部署
    【sprite】√
    【less】√
        autoprefix
        clean-css
   【concat】√ ×
* JS部署
    【coffee】√ ×
    【cmdize】
    【transport】
    【uglify】√ ×

    【copy】√ ×
* clear
    clean

---

sprite √
less √

coffee:project -
coffee:component -

cmdize -
transport -

concat:project_css -
concat:project_js -
concat:component_js -
concat:component_css -

uglify:project -
uglify:component -

copy:project_css
copy:project_js
copy:component_js
copy:component_css
copy:project_copy

clean -
connect -
watch -
compress -

---

* HTML
* CSS & LESS
* Font
* SVG
* Image
* JavaScript & CoffeeScript | jQuery & SeaJS

---

* htmls
* src
  * component
    * js & coffee -> 组件行为
    * less -> 组件表现
    * images
    * font
    * html -> 组件结构
* modules
  * component
    * version
      * js
      * css
      * images
      * fonts
* resource
  * js
  * css
  * images
    * .png
    * .jpg
    * .gif
    * .ico
  * fonts
    * .ttf
    * .woff
    * .eot
    * .svg
* .build
    * src -> modules
        * __cs
        * __cmdize_js
        * __transport_js
        * __js
        * _js -> 分发未压缩和压缩版
        * __css
        * _css
        * _images
    * src -> resource
        * __cs
        * __js
        * _js -> 分发未压缩和压缩版
        * _css
* .sprite