package edu.mit.csail.listit;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebSettings.RenderPriority;
import android.webkit.WebSettings.ZoomDensity;
import android.webkit.WebView;

import android.widget.Toast;

public class ListItActivity extends Activity {
    private WebView listItFrame;
    private Animation syncAnimation;
    private View syncAnimatedIcon;
    private MenuItem syncButton;
    private MenuItem shrinkButton;
    
    private boolean shrinkNotesState = true;
    private boolean syncState = false;
    private boolean settingsShownState = false;

    @SuppressWarnings("unused") // Not called from Java
    private Object jsInterface = new Object() {
        public void showMsg(String text) {
            showMsg(text, Toast.LENGTH_SHORT);
        }
        
        public void showMsg(String text, int duration) {
            Toast.makeText(getApplicationContext(), text, duration).show();
        }
        
        public void onSyncChanged(final boolean state) {
            syncState = state;
            runOnUiThread(new Runnable() {
                public void run() {
                    setSyncIconState(state);
                }
            });
        }
        
        public void onShrinkNotesChanged(final boolean state) {
            shrinkNotesState = state;
            runOnUiThread(new Runnable() {
                public void run() {
                    setShrinkIconState(state);
                }
            });
        }
        
        public void onSettingsPageOpenRequest() {
            settingsShownState = true;
        }
        public void onSettingsPageCloseRequest() {
            settingsShownState = false;
        }
        
    };
    
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        listItFrame = (WebView) findViewById(R.id.content);
        syncAnimation = AnimationUtils.loadAnimation(this,R.anim.sync_button);
        syncAnimation.setRepeatCount(Animation.INFINITE);
        
        WebSettings settings = listItFrame.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setSavePassword(false);
        settings.setSaveFormData(false);
        settings.setDatabasePath(getFilesDir().getAbsolutePath() + "/databases/");
        settings.setRenderPriority(RenderPriority.HIGH);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        
        listItFrame.setWebChromeClient(new WebChromeClient() {
            public void onConsoleMessage(String message, int lineNumber, String sourceID) {
                Log.d("ListIt", message + " -- From line "
                        + lineNumber + " of "
                        + sourceID);
            }
        });

        listItFrame.requestFocus(View.FOCUS_DOWN);
        
        listItFrame.addJavascriptInterface(jsInterface, "Android");
        listItFrame.loadUrl("file:///android_asset/index.html");
    }
    
    public void runJS(final String javascript) {
        listItFrame.post(new Runnable() {
            public void run() {
                listItFrame.loadUrl("javascript:" + javascript);
            }
        });
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.main_menu, menu);
        syncButton = menu.findItem(R.id.sync_button);
        shrinkButton = menu.findItem(R.id.shrink_button);
        syncAnimatedIcon = this.getLayoutInflater().inflate(R.layout.sync_button, null);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch(item.getItemId()) {
            case R.id.sync_button:
                doSync();
                return true;
            case R.id.shrink_button:
                setShrinkNotesState(!shrinkNotesState);
                return true;
            case R.id.settings_button:
                gotoSettings();
                return true;
            default: 
                return super.onOptionsItemSelected(item);
        }
    }
    
    public void doSync() {
        runJS("L.vent.trigger('user:sync')");
    }
    
    public void setShrinkNotesState(boolean state) {
        runJS("L.options.set('shrinkNotes', " + state + ")");
    }
    
    public void gotoSettings() {
        navigate("options");
    }

    public void navigate(String page) {
        runJS("L.router.navigate('"+page+"', {trigger:true})");
    }
    
    public void setSyncIconState(boolean toggle) {
        if (syncButton == null) { return; }
        if (toggle) {
            syncButton.setActionView(syncAnimatedIcon);
            syncAnimatedIcon.startAnimation(syncAnimation);
        } else {
            syncAnimatedIcon.clearAnimation();
            syncButton.setActionView(null);
        }
    }
    
    public void setShrinkIconState(boolean toggle) {
        if (shrinkButton == null) { return; }
        shrinkButton.setChecked(toggle);
        shrinkButton.setIcon(toggle ? R.drawable.ic_expander_closed : R.drawable.ic_expander_open);
    }
    
    @Override
    public void onBackPressed() {
        if (listItFrame.canGoBack()) {
            listItFrame.goBack();
        } else {
            finish();
        }
    }
}
