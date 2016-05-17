####################
# 定义全局变量
####################

!define PRODUCT_NAME			"UI开发平台 1.6.0"	# 产品的名称 √
!define PRODUCT_VERSION			"1.6.0.0"	# 产品的版本号 √
!define PRODUCT_SIZE_KB			47041	# 产品的大小
!define PRODUCT_OUTFILE_NAME	"UI开发平台_v${PRODUCT_VERSION}_setup.exe"	# 产品的输出文件名称 √
!define PRODUCT_PUBLISHER		"@yincw"	# 产品的发行人 √
!define PRODUCT_LEGAL			"盛天网络"	# 产品法人

!define EXE_NAME				"nw.exe"	# 入口exe文件名称 √

!define FOLDER_NAME				"dist"
!define ICON					"app\resources\images\ui.ico"
!define MUI_ICON				"${FOLDER_NAME}\${ICON}"
!define MUI_UNICON				"${MUI_ICON}"

####################
# 定义视觉识别系统项
####################

# VIProductVersion					"${PRODUCT_VERSION}"	# 产品版本
# VIAddVersionKey "ProductName"		"${PRODUCT_NAME}"	# 产品名称
# VIAddVersionKey "ProductVersion"	"${PRODUCT_VERSION}"	# 产品版本
# VIAddVersionKey "CompanyName"		"${PRODUCT_LEGAL}"	# 企业名称
# VIAddVersionKey "LegalCopyright"	"${PRODUCT_LEGAL}"	# 法律版权
# VIAddVersionKey "FileDescription"	"项目源码管理工具"	# 文件描述
# VIAddVersionKey "FileVersion"		"${PRODUCT_VERSION}"	# 文件版本
# VIAddVersionKey "InternalName"		"ui"	# 内部名称
# VIAddVersionKey "OriginalFilename"	"${EXE_NAME}"	# 原始文件名

####################
# 设置编译项
####################

SetCompressor			lzma
Name					"${PRODUCT_NAME}"
OutFile					"${PRODUCT_OUTFILE_NAME}"
InstallDir				"$PROGRAMFILES\ui\"
ShowInstDetails			hide
ShowUninstDetails		hide
RequestExecutionLevel	admin

####################
# 设置向导界面
####################

# 导入 MUI2 库

!include "MUI2.nsh"

# 向导页-安装

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

# 向导页-卸载

!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

# 设置 MUI2 向导界面语言

!insertmacro MUI_LANGUAGE	"SimpChinese"

####################
# 设置快速启动栏图标&卸载程序信息
####################

Section "!Files" "des_files"

	SetOutPath 	$INSTDIR
	File /r 	"${FOLDER_NAME}\*.*"
	
	SetShellVarContext 	all
		CreateDirectory		"$SMPROGRAMS\${PRODUCT_NAME}"
		CreateShortCut		"$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\${EXE_NAME}" "" "$INSTDIR\${ICON}"
		CreateShortCut		"$SMPROGRAMS\${PRODUCT_NAME}\卸载${PRODUCT_NAME}.lnk" "$INSTDIR\uninst.exe" "" "$INSTDIR\${ICON}"
		CreateShortCut		"$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${EXE_NAME}" "" "$INSTDIR\${ICON}"
	
	SetShellVarContext current
		WriteUninstaller	"$INSTDIR\uninst.exe"
		WriteRegStr HKLM	"Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\${ICON}"
		WriteRegStr HKLM	"Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
		WriteRegStr HKLM	"Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${PRODUCT_VERSION}"
		WriteRegStr HKLM	"Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\uninst.exe"
		WriteRegStr HKLM	"Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "${PRODUCT_PUBLISHER}"
		WriteRegDWORD HKLM	"Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "EstimatedSize" "${PRODUCT_SIZE_KB}"

SectionEnd

####################
# 设置卸载项
####################

Section "Uninstall"

	SetShellVarContext all
		Delete	"$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
		Delete	"$SMPROGRAMS\${PRODUCT_NAME}\卸载${PRODUCT_NAME}.lnk"
		Delete	"$DESKTOP\${PRODUCT_NAME}.lnk"
		RMDir	"$SMPROGRAMS\${PRODUCT_NAME}"
	
	SetShellVarContext current
		DeleteRegKey HKLM	"Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
		SetOutPath		"$INSTDIR"
		Delete			"$INSTDIR\*.*"
		
		SetOutPath		"$DESKTOP"
		RMDir /r 		"$INSTDIR"
		RMDir	 		"$INSTDIR"
		
		SetAutoClose	true

SectionEnd

#Function .onInit

#FunctionEnd

#Function .onInitSuccess

#FunctionEnd

Function un.onInit
	MessageBox MB_ICONQUESTION|MB_YESNO "完全删除UI开发平台及其所有组件？" /SD IDYES IDYES +2 IDNO +1
	Abort
FunctionEnd

#Function un.onUninitSuccess

#FunctionEnd
