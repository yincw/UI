####################
# ����ȫ�ֱ���
####################

!define PRODUCT_NAME			"UI����ƽ̨ 1.6.0"	# ��Ʒ������ ��
!define PRODUCT_VERSION			"1.6.0.0"	# ��Ʒ�İ汾�� ��
!define PRODUCT_SIZE_KB			47041	# ��Ʒ�Ĵ�С
!define PRODUCT_OUTFILE_NAME	"UI����ƽ̨_v${PRODUCT_VERSION}_setup.exe"	# ��Ʒ������ļ����� ��
!define PRODUCT_PUBLISHER		"@yincw"	# ��Ʒ�ķ����� ��
!define PRODUCT_LEGAL			"ʢ������"	# ��Ʒ����

!define EXE_NAME				"nw.exe"	# ���exe�ļ����� ��

!define FOLDER_NAME				"dist"
!define ICON					"app\resources\images\ui.ico"
!define MUI_ICON				"${FOLDER_NAME}\${ICON}"
!define MUI_UNICON				"${MUI_ICON}"

####################
# �����Ӿ�ʶ��ϵͳ��
####################

# VIProductVersion					"${PRODUCT_VERSION}"	# ��Ʒ�汾
# VIAddVersionKey "ProductName"		"${PRODUCT_NAME}"	# ��Ʒ����
# VIAddVersionKey "ProductVersion"	"${PRODUCT_VERSION}"	# ��Ʒ�汾
# VIAddVersionKey "CompanyName"		"${PRODUCT_LEGAL}"	# ��ҵ����
# VIAddVersionKey "LegalCopyright"	"${PRODUCT_LEGAL}"	# ���ɰ�Ȩ
# VIAddVersionKey "FileDescription"	"��ĿԴ�������"	# �ļ�����
# VIAddVersionKey "FileVersion"		"${PRODUCT_VERSION}"	# �ļ��汾
# VIAddVersionKey "InternalName"		"ui"	# �ڲ�����
# VIAddVersionKey "OriginalFilename"	"${EXE_NAME}"	# ԭʼ�ļ���

####################
# ���ñ�����
####################

SetCompressor			lzma
Name					"${PRODUCT_NAME}"
OutFile					"${PRODUCT_OUTFILE_NAME}"
InstallDir				"$PROGRAMFILES\ui\"
ShowInstDetails			hide
ShowUninstDetails		hide
RequestExecutionLevel	admin

####################
# �����򵼽���
####################

# ���� MUI2 ��

!include "MUI2.nsh"

# ��ҳ-��װ

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

# ��ҳ-ж��

!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

# ���� MUI2 �򵼽�������

!insertmacro MUI_LANGUAGE	"SimpChinese"

####################
# ���ÿ���������ͼ��&ж�س�����Ϣ
####################

Section "!Files" "des_files"

	SetOutPath 	$INSTDIR
	File /r 	"${FOLDER_NAME}\*.*"
	
	SetShellVarContext 	all
		CreateDirectory		"$SMPROGRAMS\${PRODUCT_NAME}"
		CreateShortCut		"$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\${EXE_NAME}" "" "$INSTDIR\${ICON}"
		CreateShortCut		"$SMPROGRAMS\${PRODUCT_NAME}\ж��${PRODUCT_NAME}.lnk" "$INSTDIR\uninst.exe" "" "$INSTDIR\${ICON}"
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
# ����ж����
####################

Section "Uninstall"

	SetShellVarContext all
		Delete	"$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
		Delete	"$SMPROGRAMS\${PRODUCT_NAME}\ж��${PRODUCT_NAME}.lnk"
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
	MessageBox MB_ICONQUESTION|MB_YESNO "��ȫɾ��UI����ƽ̨�������������" /SD IDYES IDYES +2 IDNO +1
	Abort
FunctionEnd

#Function un.onUninitSuccess

#FunctionEnd
