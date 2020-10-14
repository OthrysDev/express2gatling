

export default class TestUtil {

    /**
     * This method will remove any line break / tab and all spaces so that strings content can be compared
     * without worrying about formatting issues
     */
    static expectEqualCleansed (text1: string | undefined, text2: string | undefined): void {
        const sanText1 = (text1) ? TestUtil.cleanse(text1) : undefined;
        const sanText2 = (text2) ?  TestUtil.cleanse(text2) : undefined;

        expect(sanText1).toEqual(sanText2);
    }

    static cleanse (text: string): string {
        return text.replace(/[\t\n]/g, '').replace(/\s/g, '').trim();
    }

}